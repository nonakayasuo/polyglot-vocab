// ニュースプロバイダー共通型
// @/types/news.ts から再エクスポート

export type {
  Article,
  ArticleDifficulty,
  FetchArticlesRequest,
  FetchArticlesResponse,
  NewsAggregatorConfig,
  NewsCacheEntry,
  NewsCategory,
  NewsFilterOptions,
  NewsProvider,
  NewsProviderConfig,
  NewsProviderId,
  NewsProviderInfo,
} from "@/types/news";

export { NEWS_CATEGORIES, NEWS_SOURCES } from "@/types/news";

// プロバイダー共通ユーティリティ

/**
 * 文字列からシンプルなハッシュを生成
 */
export function generateArticleId(
  url: string,
  title: string,
  index: number = 0,
): string {
  const uniqueString = `${url}-${title}-${index}`;
  let hash = 0;
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-4)}`;
}

/**
 * 言語コードから国コードへの変換
 */
export function getCountryFromLanguage(language: string): string | null {
  const languageToCountry: Record<string, string> = {
    en: "us",
    es: "es",
    ko: "kr",
    zh: "cn",
    ja: "jp",
    de: "de",
    fr: "fr",
  };
  return languageToCountry[language] || null;
}

/**
 * リトライ付きfetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  delay: number = 1000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(options.signal ? 30000 : 10000),
      });

      if (response.ok) {
        return response;
      }

      // 429 (Rate Limit) の場合は待機
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : delay * (i + 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // 5xx エラーはリトライ
      if (response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }

      // その他のエラーは即座に返す
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Fetch failed after retries");
}
