// RSS フィードベースプロバイダーの基底クラス
// BBC, CNN, NHK World等のRSSフィードを統一的に処理

import Parser from "rss-parser";
import type {
  NewsProvider,
  NewsProviderInfo,
  FetchArticlesRequest,
  FetchArticlesResponse,
  Article,
  NewsCategory,
} from "../types";
import { generateArticleId, fetchWithRetry } from "../types";

// RSSパーサーのカスタム型
type CustomFeed = {
  title: string;
  description: string;
  link: string;
};

type CustomItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  creator?: string;
  categories?: string[];
  enclosure?: { url: string };
  "media:content"?: { $: { url: string } };
};

// RSSフィード設定
export interface RssFeedConfig {
  url: string;
  language: string;
  category?: NewsCategory;
  cefrLevel?: string; // 教育コンテンツ用難易度
}

// RSSプロバイダー設定
export interface RssProviderConfig {
  feeds: RssFeedConfig[];
  defaultLanguage: string;
  timeout?: number;
}

/**
 * RSSフィードベースのニュースプロバイダー基底クラス
 */
export abstract class RssNewsProvider implements NewsProvider {
  abstract readonly info: NewsProviderInfo;

  protected parser: Parser<CustomFeed, CustomItem>;
  protected config: RssProviderConfig;

  constructor(config: RssProviderConfig) {
    this.config = config;
    this.parser = new Parser<CustomFeed, CustomItem>({
      customFields: {
        item: [
          ["media:content", "media:content"],
          ["dc:creator", "creator"],
        ],
      },
      timeout: config.timeout || 10000,
    });
  }

  /**
   * 記事を取得
   */
  async fetchArticles(
    request: FetchArticlesRequest
  ): Promise<FetchArticlesResponse> {
    const { language, category, pageSize = 20 } = request;

    // フィードをフィルタリング
    const targetFeeds = this.config.feeds.filter((feed) => {
      if (language && feed.language !== language) return false;
      if (category && feed.category && feed.category !== category) return false;
      return true;
    });

    if (targetFeeds.length === 0) {
      return {
        articles: [],
        totalResults: 0,
        page: 1,
        pageSize,
        provider: this.info.id,
        fetchedAt: new Date(),
      };
    }

    // 全フィードから記事を取得
    const allArticles: Article[] = [];

    for (const feedConfig of targetFeeds) {
      try {
        const articles = await this.fetchFeed(feedConfig);
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Failed to fetch feed: ${feedConfig.url}`, error);
      }
    }

    // 公開日でソート
    allArticles.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    // ページサイズで制限
    const articles = allArticles.slice(0, pageSize);

    return {
      articles,
      totalResults: allArticles.length,
      page: 1,
      pageSize,
      provider: this.info.id,
      fetchedAt: new Date(),
    };
  }

  /**
   * 記事を検索（RSSではタイトル/説明文でフィルタリング）
   */
  async searchArticles(
    query: string,
    request: FetchArticlesRequest = {}
  ): Promise<FetchArticlesResponse> {
    const response = await this.fetchArticles(request);
    const lowerQuery = query.toLowerCase();

    const filtered = response.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery)
    );

    return {
      ...response,
      articles: filtered,
      totalResults: filtered.length,
    };
  }

  /**
   * プロバイダーが利用可能かチェック
   */
  async isAvailable(): Promise<boolean> {
    if (this.config.feeds.length === 0) return false;

    try {
      // 最初のフィードにアクセスできるか確認
      const response = await fetchWithRetry(
        this.config.feeds[0].url,
        {},
        1,
        1000
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 単一フィードを取得
   */
  protected async fetchFeed(feedConfig: RssFeedConfig): Promise<Article[]> {
    const feed = await this.parser.parseURL(feedConfig.url);

    return feed.items.map((item, index) => ({
      id: generateArticleId(item.link, item.title, index),
      title: item.title || "Untitled",
      description: item.contentSnippet || item.content || "",
      content: item.content || item.contentSnippet || "",
      url: item.link,
      imageUrl: this.extractImageUrl(item),
      source: this.info.name,
      author: item.creator || null,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      language: feedConfig.language,
      category: feedConfig.category,
    }));
  }

  /**
   * 画像URLを抽出
   */
  protected extractImageUrl(item: CustomItem): string | null {
    // media:content から取得
    if (item["media:content"]?.$?.url) {
      return item["media:content"].$.url;
    }
    // enclosure から取得
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }
    return null;
  }
}
