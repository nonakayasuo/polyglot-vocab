// News API関連の型定義

// News APIから返される記事の型
export interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// News APIのレスポンス型
export interface NewsApiResponse {
  status: "ok" | "error";
  totalResults: number;
  articles: NewsApiArticle[];
  code?: string;
  message?: string;
}

// アプリ内で使用する記事の型
export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  source: string;
  author: string | null;
  publishedAt: Date;
  language: string;
  category?: string;
}

// 記事取得のフィルターオプション
export interface NewsFilterOptions {
  category?: NewsCategory;
  language?: string;
  source?: string;
  query?: string;
  pageSize?: number;
  page?: number;
}

// ニュースカテゴリ
export type NewsCategory =
  | "general"
  | "business"
  | "technology"
  | "science"
  | "health"
  | "sports"
  | "entertainment";

export const NEWS_CATEGORIES: {
  value: NewsCategory;
  label: string;
  icon: string;
}[] = [
  { value: "general", label: "総合", icon: "📰" },
  { value: "business", label: "ビジネス", icon: "💼" },
  { value: "technology", label: "テクノロジー", icon: "💻" },
  { value: "science", label: "科学", icon: "🔬" },
  { value: "health", label: "健康", icon: "🏥" },
  { value: "sports", label: "スポーツ", icon: "⚽" },
  { value: "entertainment", label: "エンタメ", icon: "🎬" },
];

// 対応ニュースソース（6メディア）
export const NEWS_SOURCES = [
  {
    id: "the-new-york-times",
    name: "The New York Times",
    icon: "📰",
    language: "en",
  },
  { id: "bbc-news", name: "BBC News", icon: "📺", language: "en" },
  { id: "the-guardian-uk", name: "The Guardian", icon: "📰", language: "en" },
  { id: "al-jazeera-english", name: "Al Jazeera", icon: "🌍", language: "en" },
  { id: "reuters", name: "Reuters", icon: "📡", language: "en" },
  {
    id: "the-wall-street-journal",
    name: "The Wall Street Journal",
    icon: "💼",
    language: "en",
  },
] as const;

export type NewsSourceId = (typeof NEWS_SOURCES)[number]["id"];

// キャッシュされた記事
export interface CachedArticle extends Article {
  cachedAt: Date;
  expiresAt: Date;
}

// 難易度分析結果
export interface ArticleDifficulty {
  score: number; // 0-100
  level: "beginner" | "intermediate" | "advanced" | "native";
  unknownWordsCount: number;
  totalWordsCount: number;
  unknownWordsRatio: number;
  sampleUnknownWords: string[];
}
