// News API クライアントモジュール
// https://newsapi.org/docs

import type {
  Article,
  NewsApiArticle,
  NewsApiResponse,
  NewsCategory,
  NewsFilterOptions,
} from "@/types/news";

const NEWS_API_BASE_URL = "https://newsapi.org/v2";

// 環境変数からAPIキーを取得
function getApiKey(): string {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === "your_news_api_key_here") {
    throw new Error(
      "NEWS_API_KEY is not configured. Please set it in your .env file."
    );
  }
  return apiKey;
}

// シンプルなハッシュ関数
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash).toString(36);
}

// News API記事をアプリ内形式に変換
function transformArticle(
  article: NewsApiArticle,
  language: string,
  index: number = 0
): Article {
  // URL + タイトル + インデックスからユニークIDを生成
  const uniqueString = `${article.url}-${article.title}-${article.publishedAt}-${index}`;
  const id = simpleHash(uniqueString) + "_" + Date.now().toString(36).slice(-4);

  return {
    id,
    title: article.title,
    description: article.description || "",
    content: article.content || article.description || "",
    url: article.url,
    imageUrl: article.urlToImage,
    source: article.source.name,
    author: article.author,
    publishedAt: new Date(article.publishedAt),
    language,
  };
}

// トップヘッドラインを取得
export async function fetchTopHeadlines(
  options: NewsFilterOptions = {}
): Promise<Article[]> {
  const apiKey = getApiKey();
  const {
    category = "general",
    language = "en",
    source,
    pageSize = 20,
    page = 1,
  } = options;

  const params = new URLSearchParams({
    apiKey,
    pageSize: pageSize.toString(),
    page: page.toString(),
  });

  // ソース指定時はcountryとcategoryは使えない
  if (source) {
    params.set("sources", source);
  } else {
    // 言語に基づいて国を設定
    const country = getCountryFromLanguage(language);
    if (country) {
      params.set("country", country);
    }
    if (category && category !== "general") {
      params.set("category", category);
    }
  }

  const url = `${NEWS_API_BASE_URL}/top-headlines?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 600 }, // 10分間キャッシュ
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data: NewsApiResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.message || "Unknown News API error");
    }

    return data.articles
      .filter((article) => article.title && article.title !== "[Removed]")
      .map((article, index) => transformArticle(article, language, index));
  } catch (error) {
    console.error("Failed to fetch top headlines:", error);
    throw error;
  }
}

// 記事を検索
export async function searchArticles(
  query: string,
  options: NewsFilterOptions = {}
): Promise<Article[]> {
  const apiKey = getApiKey();
  const {
    language = "en",
    source,
    pageSize = 20,
    page = 1,
  } = options;

  const params = new URLSearchParams({
    apiKey,
    q: query,
    language,
    pageSize: pageSize.toString(),
    page: page.toString(),
    sortBy: "publishedAt",
  });

  if (source) {
    params.set("sources", source);
  }

  const url = `${NEWS_API_BASE_URL}/everything?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data: NewsApiResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.message || "Unknown News API error");
    }

    return data.articles
      .filter((article) => article.title && article.title !== "[Removed]")
      .map((article, index) => transformArticle(article, language, index));
  } catch (error) {
    console.error("Failed to search articles:", error);
    throw error;
  }
}

// カテゴリ別に記事を取得
export async function fetchArticlesByCategory(
  category: NewsCategory,
  options: Omit<NewsFilterOptions, "category"> = {}
): Promise<Article[]> {
  return fetchTopHeadlines({ ...options, category });
}

// ソース別に記事を取得
export async function fetchArticlesBySource(
  sourceId: string,
  options: Omit<NewsFilterOptions, "source"> = {}
): Promise<Article[]> {
  return fetchTopHeadlines({ ...options, source: sourceId });
}

// 複数ソースから記事を取得（並列）
export async function fetchArticlesFromMultipleSources(
  sourceIds: string[],
  options: Omit<NewsFilterOptions, "source"> = {}
): Promise<Article[]> {
  const promises = sourceIds.map((sourceId) =>
    fetchArticlesBySource(sourceId, options).catch(() => [])
  );

  const results = await Promise.all(promises);
  const allArticles = results.flat();

  // 公開日でソート（新しい順）
  return allArticles.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
}

// 言語コードから国コードへの変換
function getCountryFromLanguage(language: string): string | null {
  const languageToCountry: Record<string, string> = {
    en: "us", // 英語 → アメリカ
    es: "es", // スペイン語 → スペイン
    ko: "kr", // 韓国語 → 韓国
    zh: "cn", // 中国語 → 中国
    ja: "jp", // 日本語 → 日本
    de: "de", // ドイツ語 → ドイツ
    fr: "fr", // フランス語 → フランス
  };
  return languageToCountry[language] || null;
}

// 利用可能なソース一覧を取得
export async function fetchAvailableSources(): Promise<
  Array<{ id: string; name: string; language: string; country: string }>
> {
  const apiKey = getApiKey();

  const url = `${NEWS_API_BASE_URL}/top-headlines/sources?apiKey=${apiKey}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // 24時間キャッシュ
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message || "Unknown News API error");
    }

    return data.sources.map(
      (source: { id: string; name: string; language: string; country: string }) => ({
        id: source.id,
        name: source.name,
        language: source.language,
        country: source.country,
      })
    );
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    throw error;
  }
}

// インメモリキャッシュ（シンプルな実装）
const cache = new Map<string, { data: Article[]; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10分

export async function fetchArticlesWithCache(
  options: NewsFilterOptions = {}
): Promise<Article[]> {
  const cacheKey = JSON.stringify(options);
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const articles = await fetchTopHeadlines(options);

  cache.set(cacheKey, {
    data: articles,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return articles;
}

// キャッシュをクリア
export function clearNewsCache(): void {
  cache.clear();
}

