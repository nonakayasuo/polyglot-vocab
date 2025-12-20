// ローカルストレージ管理ユーティリティ

import type {
  Language,
  VocabularyStats,
  VocabularyWord,
} from "@/types/vocabulary";

const STORAGE_KEY = "polyglot-vocab-data";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getVocabulary(): VocabularyWord[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getVocabularyByLanguage(language: Language): VocabularyWord[] {
  const words = getVocabulary();
  return words.filter((w) => w.language === language);
}

export function saveVocabulary(words: VocabularyWord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function addWord(
  word: Omit<VocabularyWord, "id" | "createdAt" | "updatedAt">,
): VocabularyWord {
  const words = getVocabulary();
  const now = new Date().toISOString();
  const newWord: VocabularyWord = {
    ...word,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  words.push(newWord);
  saveVocabulary(words);
  return newWord;
}

export function updateWord(
  id: string,
  updates: Partial<VocabularyWord>,
): VocabularyWord | null {
  const words = getVocabulary();
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return null;

  words[index] = {
    ...words[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveVocabulary(words);
  return words[index];
}

export function deleteWord(id: string): boolean {
  const words = getVocabulary();
  const filtered = words.filter((w) => w.id !== id);
  if (filtered.length === words.length) return false;
  saveVocabulary(filtered);
  return true;
}

export function deleteMultipleWords(ids: string[]): number {
  const words = getVocabulary();
  const idSet = new Set(ids);
  const filtered = words.filter((w) => !idSet.has(w.id));
  const deletedCount = words.length - filtered.length;
  saveVocabulary(filtered);
  return deletedCount;
}

export function getStats(): VocabularyStats {
  const words = getVocabulary();

  const stats: VocabularyStats = {
    total: words.length,
    mastered: 0,
    learning: 0,
    notStarted: 0,
    byLanguage: {
      english: 0,
      spanish: 0,
      korean: 0,
      chinese: 0,
    },
    byCategory: {},
  };

  words.forEach((word) => {
    // ステータスカウント
    const checks = [word.check1, word.check2, word.check3].filter(
      Boolean,
    ).length;
    if (checks === 3) stats.mastered++;
    else if (checks > 0) stats.learning++;
    else stats.notStarted++;

    // 言語別カウント
    if (word.language in stats.byLanguage) {
      stats.byLanguage[word.language as Language]++;
    }

    // カテゴリ別カウント
    if (word.category) {
      stats.byCategory[word.category] =
        (stats.byCategory[word.category] || 0) + 1;
    }
  });

  return stats;
}

export function importWords(words: VocabularyWord[]): number {
  const existing = getVocabulary();
  const existingWords = new Set(existing.map((w) => `${w.word}-${w.language}`));

  const newWords = words.filter(
    (w) => !existingWords.has(`${w.word}-${w.language}`),
  );
  saveVocabulary([...existing, ...newWords]);

  return newWords.length;
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export interface LanguageStats {
  total: number;
  mastered: number;
  learning: number;
  notStarted: number;
  byCategory: Record<string, number>;
}

export function getStatsByLanguage(language: Language): LanguageStats {
  const words = getVocabularyByLanguage(language);

  const stats: LanguageStats = {
    total: words.length,
    mastered: 0,
    learning: 0,
    notStarted: 0,
    byCategory: {},
  };

  words.forEach((word) => {
    const checks = [word.check1, word.check2, word.check3].filter(
      Boolean,
    ).length;
    if (checks === 3) stats.mastered++;
    else if (checks > 0) stats.learning++;
    else stats.notStarted++;

    if (word.category) {
      stats.byCategory[word.category] =
        (stats.byCategory[word.category] || 0) + 1;
    }
  });

  return stats;
}
