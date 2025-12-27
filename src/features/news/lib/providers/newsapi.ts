// NewsAPI プロバイダー
// https://newsapi.org/docs

import type {
  Article,
  FetchArticlesRequest,
  FetchArticlesResponse,
  NewsProvider,
  NewsProviderInfo,
} from "../types";
import {
  fetchWithRetry,
  generateArticleId,
  getCountryFromLanguage,
} from "../types";

const NEWS_API_BASE_URL = "https://newsapi.org/v2";

// NewsAPI固有の型
interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: "ok" | "error";
  totalResults: number;
  articles: NewsApiArticle[];
  code?: string;
  message?: string;
}

export class NewsApiProvider implements NewsProvider {
  readonly info: NewsProviderInfo = {
    id: "newsapi",
    name: "NewsAPI",
    description: "グローバルなニュース記事を提供するAPI",
    languages: ["en", "es", "de", "fr", "it", "pt", "ru", "nl", "no", "se"],
    categories: [
      "general",
      "business",
      "technology",
      "science",
      "health",
      "sports",
      "entertainment",
    ],
    requiresApiKey: true,
    rateLimit: {
      requestsPerDay: 100, // Free tier
    },
  };

  private apiKey: string;

  constructor(apiKey: string, _timeout: number = 10000) {
    this.apiKey = apiKey;
  }

  /**
   * 記事を取得
   */
  async fetchArticles(
    request: FetchArticlesRequest,
  ): Promise<FetchArticlesResponse> {
    const {
      language = "en",
      category = "general",
      pageSize = 20,
      page = 1,
    } = request;

    const params = new URLSearchParams({
      apiKey: this.apiKey,
      pageSize: pageSize.toString(),
      page: page.toString(),
    });

    // 国を設定
    const country = getCountryFromLanguage(language);
    if (country) {
      params.set("country", country);
    }

    if (category && category !== "general") {
      params.set("category", category);
    }

    const url = `${NEWS_API_BASE_URL}/top-headlines?${params.toString()}`;

    try {
      const response = await fetchWithRetry(url, {
        headers: { "User-Agent": "NewsLingua/1.0" },
      });

      if (!response.ok) {
        throw new Error(
          `NewsAPI error: ${response.status} ${response.statusText}`,
        );
      }

      const data: NewsApiResponse = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Unknown NewsAPI error");
      }

      const articles = this.transformArticles(
        data.articles,
        language,
        category,
      );

      return {
        articles,
        totalResults: data.totalResults,
        page,
        pageSize,
        provider: "newsapi",
        fetchedAt: new Date(),
      };
    } catch (error) {
      console.error("NewsAPI fetchArticles failed:", error);
      throw error;
    }
  }

  /**
   * 記事を検索
   */
  async searchArticles(
    query: string,
    request: FetchArticlesRequest = {},
  ): Promise<FetchArticlesResponse> {
    const { language = "en", pageSize = 20, page = 1 } = request;

    const params = new URLSearchParams({
      apiKey: this.apiKey,
      q: query,
      language,
      pageSize: pageSize.toString(),
      page: page.toString(),
      sortBy: "publishedAt",
    });

    const url = `${NEWS_API_BASE_URL}/everything?${params.toString()}`;

    try {
      const response = await fetchWithRetry(url, {
        headers: { "User-Agent": "NewsLingua/1.0" },
      });

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Unknown NewsAPI error");
      }

      const articles = this.transformArticles(data.articles, language);

      return {
        articles,
        totalResults: data.totalResults,
        page,
        pageSize,
        provider: "newsapi",
        fetchedAt: new Date(),
      };
    } catch (error) {
      console.error("NewsAPI searchArticles failed:", error);
      throw error;
    }
  }

  /**
   * プロバイダーが利用可能かチェック
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === "your_news_api_key_here") {
      return false;
    }

    try {
      const response = await fetchWithRetry(
        `${NEWS_API_BASE_URL}/top-headlines/sources?apiKey=${this.apiKey}`,
        {},
        1,
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * NewsAPI記事をアプリ内形式に変換
   */
  private transformArticles(
    articles: NewsApiArticle[],
    language: string,
    category?: string,
  ): Article[] {
    return articles
      .filter((article) => article.title && article.title !== "[Removed]")
      .map((article, index) => ({
        id: generateArticleId(article.url, article.title, index),
        title: article.title,
        description: article.description || "",
        content: article.content || article.description || "",
        url: article.url,
        imageUrl: article.urlToImage,
        source: article.source.name,
        author: article.author,
        publishedAt: new Date(article.publishedAt),
        language,
        category,
      }));
  }
}

/**
 * NewsAPIプロバイダーを作成
 */
export function createNewsApiProvider(): NewsApiProvider | null {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === "your_news_api_key_here") {
    console.warn("NEWS_API_KEY is not configured");
    return null;
  }
  return new NewsApiProvider(apiKey);
}
