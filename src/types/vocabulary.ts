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
  note: string;
  language: Language;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyStats {
  total: number;
  mastered: number; // check1, check2, check3 すべてtrue
  learning: number; // 一部true
  notStarted: number; // すべてfalse
  byLanguage: Record<Language, number>;
  byCategory: Record<string, number>;
}

export interface FilterOptions {
  search: string;
  language: Language | "all";
  category: string | "all";
  status: "all" | "mastered" | "learning" | "notStarted";
  sortBy: "word" | "createdAt" | "updatedAt";
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
