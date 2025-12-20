// API クライアント

import type { Language } from "@/types/vocabulary";

export interface VocabularyWordDB {
  id: string;
  word: string;
  pronunciation: string;
  category: string;
  meaning: string;
  example: string;
  exampleTranslation: string; // 例文の日本語訳
  note: string;
  language: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageStats {
  total: number;
  mastered: number;
  learning: number;
  notStarted: number;
  byCategory: Record<string, number>;
}

export interface VocabularyStats {
  total: number;
  mastered: number;
  learning: number;
  notStarted: number;
  byLanguage: Record<string, number>;
  byCategory: Record<string, number>;
}

// 単語一覧を取得
export async function fetchWords(
  language?: Language,
): Promise<VocabularyWordDB[]> {
  const url = language ? `/api/words?language=${language}` : "/api/words";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch words");
  return res.json();
}

// 単語を追加
export async function createWord(
  data: Omit<VocabularyWordDB, "id" | "createdAt" | "updatedAt">,
): Promise<VocabularyWordDB> {
  const res = await fetch("/api/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create word");
  return res.json();
}

// 単語を更新
export async function updateWordAPI(
  id: string,
  data: Partial<VocabularyWordDB>,
): Promise<VocabularyWordDB> {
  const res = await fetch(`/api/words/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update word");
  return res.json();
}

// 単語を削除
export async function deleteWordAPI(id: string): Promise<void> {
  const res = await fetch(`/api/words/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete word");
}

// 複数の単語を一括削除
export async function deleteWordsAPI(
  ids: string[],
): Promise<{ deleted: number }> {
  const res = await fetch("/api/words/bulk", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to delete words");
  return res.json();
}

// 複数の単語を一括インポート
export async function importWordsAPI(
  words: Array<Omit<VocabularyWordDB, "id" | "createdAt" | "updatedAt">>,
): Promise<{ imported: number }> {
  const res = await fetch("/api/words/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ words }),
  });
  if (!res.ok) throw new Error("Failed to import words");
  return res.json();
}

// 統計情報を取得
export async function fetchStats(
  language?: Language,
): Promise<VocabularyStats | LanguageStats> {
  const url = language ? `/api/stats?language=${language}` : "/api/stats";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
