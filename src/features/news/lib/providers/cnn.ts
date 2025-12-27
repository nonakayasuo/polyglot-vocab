// CNN プロバイダー
// https://edition.cnn.com

import type { NewsProviderInfo } from "../types";
import { RssNewsProvider, type RssProviderConfig } from "./rss-base";

// CNN フィード設定
const CNN_FEEDS: RssProviderConfig = {
  defaultLanguage: "en",
  feeds: [
    {
      url: "http://rss.cnn.com/rss/edition_world.rss",
      language: "en",
      category: "general",
    },
    {
      url: "http://rss.cnn.com/rss/money_news_international.rss",
      language: "en",
      category: "business",
    },
    {
      url: "http://rss.cnn.com/rss/edition_technology.rss",
      language: "en",
      category: "technology",
    },
    {
      url: "http://rss.cnn.com/rss/edition_space.rss",
      language: "en",
      category: "science",
    },
    {
      url: "http://rss.cnn.com/rss/edition_sport.rss",
      language: "en",
      category: "sports",
    },
    {
      url: "http://rss.cnn.com/rss/edition_entertainment.rss",
      language: "en",
      category: "entertainment",
    },
  ],
};

/**
 * CNN プロバイダー
 */
export class CnnProvider extends RssNewsProvider {
  readonly info: NewsProviderInfo = {
    id: "cnn",
    name: "CNN",
    description: "CNN International News",
    languages: ["en"],
    categories: [
      "general",
      "business",
      "technology",
      "science",
      "sports",
      "entertainment",
    ],
    requiresApiKey: false,
  };

  constructor() {
    super(CNN_FEEDS);
  }
}

/**
 * CNN プロバイダーを作成
 */
export function createCnnProvider(): CnnProvider {
  return new CnnProvider();
}
