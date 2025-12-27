// NHK World プロバイダー
// https://www3.nhk.or.jp/nhkworld/

import type { NewsProviderInfo } from "../types";
import { RssNewsProvider, type RssProviderConfig } from "./rss-base";

// NHK World フィード設定
const NHK_WORLD_FEEDS: RssProviderConfig = {
  defaultLanguage: "en",
  feeds: [
    // NHK World English
    {
      url: "https://www3.nhk.or.jp/rss/news/cat0.xml",
      language: "ja",
      category: "general",
    },
    // NHK World News Web Easy (やさしい日本語) - A2-B1レベル
    {
      url: "https://www3.nhk.or.jp/news/easy/news-list.json",
      language: "ja",
      category: "general",
      cefrLevel: "A2",
    },
  ],
};

// NHK World Easy Japanese フィード（直接JSON）
const NHK_EASY_NEWS_URL = "https://www3.nhk.or.jp/news/easy/news-list.json";

/**
 * NHK World プロバイダー
 * 日本のニュースを英語・日本語で提供
 */
export class NhkWorldProvider extends RssNewsProvider {
  readonly info: NewsProviderInfo = {
    id: "nhk-world",
    name: "NHK World",
    description: "NHK World Japan ニュース",
    languages: ["en", "ja"],
    categories: ["general"],
    requiresApiKey: false,
  };

  constructor() {
    // 基本的なRSSフィードのみ
    super({
      defaultLanguage: "ja",
      feeds: [
        {
          url: "https://www3.nhk.or.jp/rss/news/cat0.xml",
          language: "ja",
          category: "general",
        },
      ],
    });
  }

  /**
   * NHK News Web Easy の記事を取得
   * やさしい日本語で書かれた学習者向けニュース
   */
  async fetchEasyNews(): Promise<
    Array<{
      id: string;
      title: string;
      titleWithRuby: string;
      url: string;
      publishedAt: Date;
    }>
  > {
    try {
      const response = await fetch(NHK_EASY_NEWS_URL);
      if (!response.ok) {
        throw new Error(`NHK Easy News error: ${response.status}`);
      }

      const data = await response.json();
      const articles: Array<{
        id: string;
        title: string;
        titleWithRuby: string;
        url: string;
        publishedAt: Date;
      }> = [];

      // NHK Easy Newsは日付ごとにグループ化されている
      for (const [dateKey, newsItems] of Object.entries(data)) {
        if (!Array.isArray(newsItems)) continue;

        for (const item of newsItems as Array<{
          news_id: string;
          title: string;
          title_with_ruby: string;
          news_prearranged_time: string;
        }>) {
          articles.push({
            id: item.news_id,
            title: item.title,
            titleWithRuby: item.title_with_ruby,
            url: `https://www3.nhk.or.jp/news/easy/${item.news_id}/${item.news_id}.html`,
            publishedAt: new Date(item.news_prearranged_time),
          });
        }
      }

      // 日付でソート
      articles.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      );

      return articles;
    } catch (error) {
      console.error("Failed to fetch NHK Easy News:", error);
      return [];
    }
  }
}

/**
 * NHK World プロバイダーを作成
 */
export function createNhkWorldProvider(): NhkWorldProvider {
  return new NhkWorldProvider();
}
