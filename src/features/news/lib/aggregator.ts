// ニュースアグリゲーター
// 複数のプロバイダーを統合して記事を取得

import {
  generateCacheKey,
  getArticlesFromDb,
  getFromMemoryCache,
  persistArticles,
  setMemoryCache,
} from "./cache";
import { createBbcLearningProvider } from "./providers/bbc";
import { createCnnProvider } from "./providers/cnn";
import { createNewsApiProvider } from "./providers/newsapi";
import { createNhkWorldProvider } from "./providers/nhk";
import type {
  Article,
  FetchArticlesRequest,
  FetchArticlesResponse,
  NewsCategory,
  NewsProvider,
  NewsProviderId,
} from "./types";

export interface AggregatorOptions {
  enableCache?: boolean;
  cacheTtlMinutes?: number;
  persistToDb?: boolean;
  fallbackToDb?: boolean;
}

const DEFAULT_OPTIONS: Required<AggregatorOptions> = {
  enableCache: true,
  cacheTtlMinutes: 10,
  persistToDb: true,
  fallbackToDb: true,
};

/**
 * ニュースアグリゲーター
 * 複数のニュースプロバイダーを統合管理
 */
export class NewsAggregator {
  private providers: Map<NewsProviderId, NewsProvider> = new Map();
  private options: Required<AggregatorOptions>;

  constructor(options: AggregatorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.initializeProviders();
  }

  /**
   * プロバイダーを初期化
   */
  private initializeProviders(): void {
    // NewsAPI（APIキーが必要）
    const newsApiProvider = createNewsApiProvider();
    if (newsApiProvider) {
      this.providers.set("newsapi", newsApiProvider);
    }

    // BBC Learning English（無料RSS）
    const bbcLearningProvider = createBbcLearningProvider();
    this.providers.set("bbc", bbcLearningProvider);

    // CNN（無料RSS）
    const cnnProvider = createCnnProvider();
    this.providers.set("cnn", cnnProvider);

    // NHK World（無料RSS）
    const nhkProvider = createNhkWorldProvider();
    this.providers.set("nhk-world", nhkProvider);
  }

  /**
   * プロバイダーを追加
   */
  addProvider(provider: NewsProvider): void {
    this.providers.set(provider.info.id, provider);
  }

  /**
   * プロバイダーを削除
   */
  removeProvider(providerId: NewsProviderId): boolean {
    return this.providers.delete(providerId);
  }

  /**
   * 利用可能なプロバイダー一覧を取得
   */
  async getAvailableProviders(): Promise<NewsProviderId[]> {
    const available: NewsProviderId[] = [];
    for (const [id, provider] of this.providers.entries()) {
      if (await provider.isAvailable()) {
        available.push(id);
      }
    }
    return available;
  }

  /**
   * 記事を取得（キャッシュ対応）
   */
  async fetchArticles(
    request: FetchArticlesRequest = {},
    providerId?: NewsProviderId,
  ): Promise<FetchArticlesResponse> {
    const { language = "en", category, page = 1 } = request;

    // キャッシュキーを生成
    const cacheKey = generateCacheKey(
      providerId || "newsapi",
      language,
      category,
      undefined,
      page,
    );

    // メモリキャッシュをチェック
    if (this.options.enableCache) {
      const cached = getFromMemoryCache(cacheKey);
      if (cached) {
        return {
          articles: cached,
          totalResults: cached.length,
          page,
          pageSize: request.pageSize || 20,
          provider: providerId || "newsapi",
          fetchedAt: new Date(),
        };
      }
    }

    // プロバイダーを選択
    const provider = providerId
      ? this.providers.get(providerId)
      : this.getDefaultProvider();

    if (!provider) {
      // DBフォールバック
      if (this.options.fallbackToDb) {
        const dbArticles = await getArticlesFromDb(language, category);
        if (dbArticles.length > 0) {
          return {
            articles: dbArticles,
            totalResults: dbArticles.length,
            page: 1,
            pageSize: dbArticles.length,
            provider: "newsapi",
            fetchedAt: new Date(),
          };
        }
      }
      throw new Error("No news provider available");
    }

    try {
      const response = await provider.fetchArticles(request);

      // キャッシュに保存
      if (this.options.enableCache) {
        setMemoryCache(
          cacheKey,
          response.articles,
          response.provider,
          this.options.cacheTtlMinutes,
        );
      }

      // DBに永続化
      if (this.options.persistToDb && response.articles.length > 0) {
        persistArticles(response.articles).catch(console.error);
      }

      return response;
    } catch (error) {
      // エラー時はDBフォールバック
      if (this.options.fallbackToDb) {
        const dbArticles = await getArticlesFromDb(language, category);
        if (dbArticles.length > 0) {
          console.warn("Using cached articles from DB due to fetch error");
          return {
            articles: dbArticles,
            totalResults: dbArticles.length,
            page: 1,
            pageSize: dbArticles.length,
            provider: providerId || "newsapi",
            fetchedAt: new Date(),
          };
        }
      }
      throw error;
    }
  }

  /**
   * 記事を検索
   */
  async searchArticles(
    query: string,
    request: FetchArticlesRequest = {},
    providerId?: NewsProviderId,
  ): Promise<FetchArticlesResponse> {
    const { language = "en", page = 1 } = request;

    // キャッシュキーを生成
    const cacheKey = generateCacheKey(
      providerId || "newsapi",
      language,
      undefined,
      query,
      page,
    );

    // メモリキャッシュをチェック
    if (this.options.enableCache) {
      const cached = getFromMemoryCache(cacheKey);
      if (cached) {
        return {
          articles: cached,
          totalResults: cached.length,
          page,
          pageSize: request.pageSize || 20,
          provider: providerId || "newsapi",
          fetchedAt: new Date(),
        };
      }
    }

    // プロバイダーを選択
    const provider = providerId
      ? this.providers.get(providerId)
      : this.getDefaultProvider();

    if (!provider) {
      throw new Error("No news provider available");
    }

    const response = await provider.searchArticles(query, request);

    // キャッシュに保存
    if (this.options.enableCache) {
      setMemoryCache(
        cacheKey,
        response.articles,
        response.provider,
        this.options.cacheTtlMinutes,
      );
    }

    // DBに永続化
    if (this.options.persistToDb && response.articles.length > 0) {
      persistArticles(response.articles).catch(console.error);
    }

    return response;
  }

  /**
   * 複数プロバイダーから並列取得
   */
  async fetchFromMultipleProviders(
    request: FetchArticlesRequest = {},
  ): Promise<Article[]> {
    const providerIds = Array.from(this.providers.keys());

    const results = await Promise.allSettled(
      providerIds.map((id) => this.fetchArticles(request, id)),
    );

    const allArticles: Article[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value.articles);
      }
    }

    // 公開日でソート（新しい順）
    return allArticles.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
  }

  /**
   * カテゴリ別に記事を取得
   */
  async fetchByCategory(
    category: NewsCategory,
    request: Omit<FetchArticlesRequest, "category"> = {},
  ): Promise<FetchArticlesResponse> {
    return this.fetchArticles({ ...request, category });
  }

  /**
   * デフォルトプロバイダーを取得
   */
  private getDefaultProvider(): NewsProvider | undefined {
    // 優先順位: newsapi -> bbc -> cnn -> ...
    const priority: NewsProviderId[] = ["newsapi", "bbc", "cnn", "nhk-world"];
    for (const id of priority) {
      const provider = this.providers.get(id);
      if (provider) return provider;
    }
    return this.providers.values().next().value;
  }
}

// シングルトンインスタンス
let aggregatorInstance: NewsAggregator | null = null;

/**
 * ニュースアグリゲーターを取得（シングルトン）
 */
export function getNewsAggregator(options?: AggregatorOptions): NewsAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new NewsAggregator(options);
  }
  return aggregatorInstance;
}

/**
 * アグリゲーターをリセット（テスト用）
 */
export function resetNewsAggregator(): void {
  aggregatorInstance = null;
}
