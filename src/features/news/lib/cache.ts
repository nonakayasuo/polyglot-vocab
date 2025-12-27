// ニュースキャッシュ管理
// インメモリ + Prisma永続化のハイブリッドキャッシュ

import { prisma } from "@/lib/prisma";
import type { Article, NewsCacheEntry, NewsProviderId } from "./types";

// インメモリキャッシュ
const memoryCache = new Map<string, NewsCacheEntry>();
const DEFAULT_TTL_MINUTES = 10;

/**
 * キャッシュキーを生成
 */
export function generateCacheKey(
  provider: NewsProviderId,
  language: string,
  category?: string,
  query?: string,
  page: number = 1,
): string {
  const parts = [provider, language];
  if (category) parts.push(`cat:${category}`);
  if (query) parts.push(`q:${query}`);
  parts.push(`p:${page}`);
  return parts.join(":");
}

/**
 * メモリキャッシュから取得
 */
export function getFromMemoryCache(key: string): Article[] | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt < new Date()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.articles;
}

/**
 * メモリキャッシュに保存
 */
export function setMemoryCache(
  key: string,
  articles: Article[],
  provider: NewsProviderId,
  ttlMinutes: number = DEFAULT_TTL_MINUTES,
): void {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  memoryCache.set(key, {
    key,
    articles,
    provider,
    fetchedAt: now,
    expiresAt,
  });
}

/**
 * メモリキャッシュをクリア
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
}

/**
 * 期限切れのメモリキャッシュを削除
 */
export function pruneMemoryCache(): number {
  const now = new Date();
  let prunedCount = 0;

  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
      prunedCount++;
    }
  }

  return prunedCount;
}

/**
 * 記事をDBに永続化（重複チェック付き）
 */
export async function persistArticles(articles: Article[]): Promise<number> {
  let savedCount = 0;

  for (const article of articles) {
    try {
      // externalIdはURLのハッシュ
      const externalId = Buffer.from(article.url)
        .toString("base64")
        .slice(0, 100);

      await prisma.article.upsert({
        where: { externalId },
        update: {
          title: article.title,
          description: article.description,
          content: article.content,
          imageUrl: article.imageUrl,
          cachedAt: new Date(),
        },
        create: {
          externalId,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          imageUrl: article.imageUrl,
          source: article.source,
          author: article.author,
          language: article.language,
          category: article.category,
          publishedAt: article.publishedAt,
          cachedAt: new Date(),
        },
      });
      savedCount++;
    } catch (error) {
      console.error(`Failed to persist article: ${article.title}`, error);
    }
  }

  return savedCount;
}

/**
 * DBからキャッシュ記事を取得
 */
export async function getArticlesFromDb(
  language: string,
  category?: string,
  limit: number = 20,
  offset: number = 0,
): Promise<Article[]> {
  const articles = await prisma.article.findMany({
    where: {
      language,
      ...(category && { category }),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });

  return articles.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    content: a.content,
    url: a.url,
    imageUrl: a.imageUrl,
    source: a.source,
    author: a.author,
    publishedAt: a.publishedAt,
    language: a.language,
    category: a.category ?? undefined,
  }));
}

/**
 * 古いキャッシュ記事を削除
 */
export async function pruneOldArticles(daysOld: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.article.deleteMany({
    where: {
      cachedAt: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * キャッシュ統計を取得
 */
export function getCacheStats(): {
  memoryEntries: number;
  memorySizeEstimate: string;
} {
  let sizeEstimate = 0;
  for (const entry of memoryCache.values()) {
    sizeEstimate += JSON.stringify(entry).length;
  }

  return {
    memoryEntries: memoryCache.size,
    memorySizeEstimate: `${(sizeEstimate / 1024).toFixed(2)} KB`,
  };
}
