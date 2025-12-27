// BBC Learning English プロバイダー
// https://www.bbc.co.uk/learningenglish

import type { NewsProviderInfo } from "../types";
import { RssNewsProvider, type RssProviderConfig } from "./rss-base";

// BBC Learning English フィード設定
const BBC_LEARNING_FEEDS: RssProviderConfig = {
  defaultLanguage: "en",
  feeds: [
    // 6 Minute English - B1-B2レベル
    {
      url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english/rss",
      language: "en",
      category: "general",
      cefrLevel: "B1",
    },
    // News Review - B2-C1レベル
    {
      url: "https://www.bbc.co.uk/learningenglish/english/features/news-review/rss",
      language: "en",
      category: "general",
      cefrLevel: "B2",
    },
    // The English We Speak - A2-B1レベル
    {
      url: "https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak/rss",
      language: "en",
      category: "general",
      cefrLevel: "A2",
    },
    // LingoHack - B2レベル
    {
      url: "https://www.bbc.co.uk/learningenglish/english/features/lingohack/rss",
      language: "en",
      category: "general",
      cefrLevel: "B2",
    },
  ],
};

// BBC News フィード設定（一般ニュース用）
const BBC_NEWS_FEEDS: RssProviderConfig = {
  defaultLanguage: "en",
  feeds: [
    {
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      language: "en",
      category: "general",
    },
    {
      url: "https://feeds.bbci.co.uk/news/business/rss.xml",
      language: "en",
      category: "business",
    },
    {
      url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
      language: "en",
      category: "technology",
    },
    {
      url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      language: "en",
      category: "science",
    },
    {
      url: "https://feeds.bbci.co.uk/news/health/rss.xml",
      language: "en",
      category: "health",
    },
    {
      url: "https://feeds.bbci.co.uk/sport/rss.xml",
      language: "en",
      category: "sports",
    },
    {
      url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
      language: "en",
      category: "entertainment",
    },
  ],
};

/**
 * BBC Learning English プロバイダー
 * 英語学習者向けの教育コンテンツを提供
 */
export class BbcLearningProvider extends RssNewsProvider {
  readonly info: NewsProviderInfo = {
    id: "bbc",
    name: "BBC Learning English",
    description: "英語学習者向けの教育コンテンツ",
    languages: ["en"],
    categories: ["general"],
    requiresApiKey: false,
  };

  constructor() {
    super(BBC_LEARNING_FEEDS);
  }
}

/**
 * BBC News プロバイダー
 * 一般ニュース記事を提供
 */
export class BbcNewsProvider extends RssNewsProvider {
  readonly info: NewsProviderInfo = {
    id: "bbc",
    name: "BBC News",
    description: "BBCの世界ニュース",
    languages: ["en"],
    categories: [
      "general",
      "business",
      "technology",
      "science",
      "health",
      "sports",
      "entertainment",
    ],
    requiresApiKey: false,
  };

  constructor() {
    super(BBC_NEWS_FEEDS);
  }
}

/**
 * BBC Learning English プロバイダーを作成
 */
export function createBbcLearningProvider(): BbcLearningProvider {
  return new BbcLearningProvider();
}

/**
 * BBC News プロバイダーを作成
 */
export function createBbcNewsProvider(): BbcNewsProvider {
  return new BbcNewsProvider();
}
