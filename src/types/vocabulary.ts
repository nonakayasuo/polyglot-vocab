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
  mastered: number; // 習得済み（check1 = true）
  notStarted: number; // 未習得（check1 = false）
  byLanguage: Record<Language, number>;
  byCategory: Record<string, number>;
}

export interface FilterOptions {
  search: string;
  language: Language | "all";
  category: string | "all";
  source: string | "all";
  status: "all" | "learned" | "notLearned";
  sortBy: "displayOrder" | "word" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

// 英語のカテゴリ
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

// スペイン語のカテゴリ
export const SPANISH_CATEGORIES = [
  "Sustantivo", // 名詞
  "Verbo", // 動詞
  "V: Transitivo", // 他動詞
  "V: Intransitivo", // 自動詞
  "V: Pronominal", // 再帰動詞
  "Adjetivo", // 形容詞
  "Adverbio", // 副詞
  "Frase", // フレーズ
  "Expresión", // 表現・イディオム
  "Preposición", // 前置詞
  "Conjunción", // 接続詞
  "Otro", // その他
] as const;

// 韓国語のカテゴリ
export const KOREAN_CATEGORIES = [
  "명사", // 名詞
  "동사", // 動詞
  "형용사", // 形容詞
  "부사", // 副詞
  "조사", // 助詞
  "관형사", // 冠形詞
  "접속사", // 接続詞
  "문장", // フレーズ
  "숙어", // 熟語・イディオム
  "기타", // その他
] as const;

// 中国語のカテゴリ
export const CHINESE_CATEGORIES = [
  "名词", // 名詞
  "动词", // 動詞
  "形容词", // 形容詞
  "副词", // 副詞
  "量词", // 量詞
  "代词", // 代名詞
  "介词", // 前置詞
  "连词", // 接続詞
  "短语", // フレーズ
  "成语", // 成語・イディオム
  "其他", // その他
] as const;

// 言語に応じたカテゴリを取得
export function getCategoriesForLanguage(
  language: Language
): readonly string[] {
  switch (language) {
    case "spanish":
      return SPANISH_CATEGORIES;
    case "korean":
      return KOREAN_CATEGORIES;
    case "chinese":
      return CHINESE_CATEGORIES;
    default:
      return CATEGORIES;
  }
}

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "spanish", label: "Español", flag: "🇪🇸" },
  { value: "korean", label: "한국어", flag: "🇰🇷" },
  { value: "chinese", label: "中文", flag: "🇨🇳" },
];

// ソースのカテゴリー
export type SourceCategory = "news" | "exam" | "other";

// 単語のソース（出典）オプション - ニュースサイト6つに限定
export const WORD_SOURCES = [
  // 📰 主要ニュースサイト（6メディア）
  {
    value: "The New York Times",
    label: "The New York Times",
    shortLabel: "NYT",
    url: "https://www.nytimes.com",
    category: "news" as SourceCategory,
    icon: "📰",
  },
  {
    value: "BBC",
    label: "BBC News",
    shortLabel: "BBC",
    url: "https://www.bbc.com/news",
    category: "news" as SourceCategory,
    icon: "📺",
  },
  {
    value: "The Guardian",
    label: "The Guardian",
    shortLabel: "Guardian",
    url: "https://www.theguardian.com",
    category: "news" as SourceCategory,
    icon: "📰",
  },
  {
    value: "Al Jazeera",
    label: "Al Jazeera",
    shortLabel: "Al Jazeera",
    url: "https://www.aljazeera.com",
    category: "news" as SourceCategory,
    icon: "🌍",
  },
  {
    value: "Reuters",
    label: "Reuters",
    shortLabel: "Reuters",
    url: "https://www.reuters.com",
    category: "news" as SourceCategory,
    icon: "📡",
  },
  {
    value: "The Wall Street Journal",
    label: "The Wall Street Journal",
    shortLabel: "WSJ",
    url: "https://www.wsj.com",
    category: "news" as SourceCategory,
    icon: "💼",
  },
  // 📚 試験・資格
  {
    value: "英検準1級",
    label: "英検準1級",
    shortLabel: "英検準1",
    url: null,
    category: "exam" as SourceCategory,
    icon: "📚",
  },
  {
    value: "英検1級",
    label: "英検1級",
    shortLabel: "英検1",
    url: null,
    category: "exam" as SourceCategory,
    icon: "📚",
  },
  {
    value: "TOEIC",
    label: "TOEIC",
    shortLabel: "TOEIC",
    url: null,
    category: "exam" as SourceCategory,
    icon: "💼",
  },
  {
    value: "IELTS",
    label: "IELTS",
    shortLabel: "IELTS",
    url: null,
    category: "exam" as SourceCategory,
    icon: "🎓",
  },
] as const;

export type WordSource = (typeof WORD_SOURCES)[number]["value"] | "";

// ソース情報を取得するヘルパー関数
export function getSourceInfo(source: string) {
  return WORD_SOURCES.find((s) => s.value === source) || null;
}

// ニュースソースのみを取得
export function getNewsSources() {
  return WORD_SOURCES.filter((s) => s.category === "news");
}

// 試験ソースのみを取得
export function getExamSources() {
  return WORD_SOURCES.filter((s) => s.category === "exam");
}
