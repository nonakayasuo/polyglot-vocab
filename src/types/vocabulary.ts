// 単語データの型定義

export type Language = "english" | "spanish" | "korean" | "chinese";

export type Category =
  | "Noun"
  | "Verb"
  | "V: Transitive"
  | "V: Intransitive"
  | "V: Phrasal"
  | "Adjective"
  | "Adverb"
  | "Phrase"
  | "Idiom"
  | "Preposition"
  | "Conjunction"
  | "Other";

export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  category: Category | string;
  meaning: string;
  example: string;
  exampleTranslation: string; // 例文の日本語訳
  note: string;
  language: Language;
  check1: boolean; // フラッシュカードで正解したかどうか（習得済みフラグ）
  check2: boolean;
  check3: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyStats {
  total: number;
  learned: number; // 習得済み（check1 = true）
  notLearned: number; // 未学習（check1 = false）
  byLanguage: Record<Language, number>;
  byCategory: Record<string, number>;
}

export interface FilterOptions {
  search: string;
  language: Language | "all";
  category: string | "all";
  status: "all" | "learned" | "notLearned";
  sortBy: "displayOrder" | "word" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

export const CATEGORIES: Category[] = [
  "Noun",
  "Verb",
  "V: Transitive",
  "V: Intransitive",
  "V: Phrasal",
  "Adjective",
  "Adverb",
  "Phrase",
  "Idiom",
  "Preposition",
  "Conjunction",
  "Other",
];

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "spanish", label: "Español", flag: "🇪🇸" },
  { value: "korean", label: "한국어", flag: "🇰🇷" },
  { value: "chinese", label: "中文", flag: "🇨🇳" },
];

// 単語のソース（出典）オプション
export const WORD_SOURCES = [
  { value: "英検準1級", label: "英検準1級" },
  { value: "英検1級", label: "英検1級" },
  { value: "The New York Times", label: "The New York Times" },
  { value: "BBC", label: "BBC" },
  { value: "CNN", label: "CNN" },
  { value: "The Economist", label: "The Economist" },
  { value: "TOEFL", label: "TOEFL" },
  { value: "TOEIC", label: "TOEIC" },
  { value: "GRE", label: "GRE" },
  { value: "SAT", label: "SAT" },
] as const;

export type WordSource = (typeof WORD_SOURCES)[number]["value"] | "";
