// 記事難易度分析エンジン
// CEFR (A1-C2) に基づく記事の難易度判定

import type { CEFRLevel, WordDifficultyInfo } from "@/lib/word-difficulty";
import {
  filterAdvancedWords,
  getCEFRLevel,
  isAcademicWord,
} from "@/lib/word-difficulty";

// ========================================
// 型定義
// ========================================

export interface ArticleDifficultyResult {
  // 基本情報
  totalWords: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;

  // 難易度スコア
  overallScore: number; // 0-100
  cefrLevel: CEFRLevel;
  readabilityScore: number; // Flesch-Kincaid風スコア

  // 語彙分析
  vocabularyAnalysis: {
    basicWordsRatio: number; // A1-B1 の割合
    intermediateWordsRatio: number; // B2 の割合
    advancedWordsRatio: number; // C1-C2 の割合
    unknownWordsCount: number;
    academicWordsCount: number;
    difficultWords: WordDifficultyInfo[];
  };

  // 文法・構造分析
  structureAnalysis: {
    averageSentenceLength: number;
    averageWordLength: number;
    longSentenceRatio: number; // 20語以上の文の割合
    complexPunctuationRatio: number; // セミコロン、コロン等
    passiveVoiceEstimate: number; // 受動態の推定割合
  };

  // 推奨
  recommendations: {
    targetAudience: string;
    estimatedReadingTime: number; // 分
    suggestedPreparation: string[];
  };
}

// ========================================
// 分析ヘルパー関数
// ========================================

/**
 * テキストを単語に分割
 */
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z']+\b/g) || [];
}

/**
 * テキストを文に分割
 */
function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
}

/**
 * テキストを段落に分割
 */
function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter((p) => p.trim().length > 0);
}

/**
 * 単語のCEFRレベル分布を計算
 */
function analyzeLevelDistribution(
  words: string[],
): Record<CEFRLevel | "unknown", number> {
  const distribution: Record<CEFRLevel | "unknown", number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
    unknown: 0,
  };

  for (const word of words) {
    const level = getCEFRLevel(word);
    if (level) {
      distribution[level]++;
    } else {
      // 短い一般的な単語はA1-B1
      if (word.length <= 5) {
        distribution.B1++;
      } else {
        distribution.unknown++;
      }
    }
  }

  return distribution;
}

/**
 * 平均文長を計算
 */
function calculateAverageSentenceLength(
  sentences: string[],
  words: string[],
): number {
  if (sentences.length === 0) return 0;
  return words.length / sentences.length;
}

/**
 * 平均単語長を計算
 */
function calculateAverageWordLength(words: string[]): number {
  if (words.length === 0) return 0;
  const totalLength = words.reduce((sum, w) => sum + w.length, 0);
  return totalLength / words.length;
}

/**
 * 複雑な句読点の割合を計算
 */
function calculateComplexPunctuation(text: string): number {
  const totalPunctuation = (text.match(/[.,!?;:]/g) || []).length;
  const complexPunctuation = (text.match(/[;:]/g) || []).length;
  if (totalPunctuation === 0) return 0;
  return complexPunctuation / totalPunctuation;
}

/**
 * 受動態の推定（be動詞 + 過去分詞パターン）
 */
function estimatePassiveVoice(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;

  // 簡易的な受動態検出
  const passivePattern =
    /\b(is|are|was|were|been|being)\s+\w+ed\b|\b(is|are|was|were|been|being)\s+\w+en\b/gi;
  const passiveSentences = sentences.filter((s) => passivePattern.test(s));

  return passiveSentences.length / sentences.length;
}

/**
 * CEFRスコアから推定レベルを判定
 */
function scoreToCEFR(score: number): CEFRLevel {
  if (score < 20) return "A1";
  if (score < 35) return "A2";
  if (score < 50) return "B1";
  if (score < 65) return "B2";
  if (score < 80) return "C1";
  return "C2";
}

/**
 * 読書時間を推定（分）
 * 英語の平均読書速度: 約200-250語/分
 */
function estimateReadingTime(
  wordCount: number,
  difficultyScore: number,
): number {
  // 難易度に応じて読書速度を調整
  let wordsPerMinute = 200;
  if (difficultyScore < 30) wordsPerMinute = 250;
  else if (difficultyScore < 50) wordsPerMinute = 200;
  else if (difficultyScore < 70) wordsPerMinute = 150;
  else wordsPerMinute = 100;

  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * 難しい単語をハイライト用に抽出
 */
function extractDifficultWords(
  words: string[],
  minLevel: CEFRLevel = "B2",
): WordDifficultyInfo[] {
  const uniqueWords = [...new Set(words)];
  return filterAdvancedWords(uniqueWords, {
    minLevel,
    maxLevel: "C2",
    excludeBasic: true,
  }).slice(0, 20); // 上位20語
}

// ========================================
// メイン分析関数
// ========================================

/**
 * 記事の難易度を分析
 */
export function analyzeArticleDifficulty(
  text: string,
  userKnownWords: Set<string> = new Set(),
): ArticleDifficultyResult {
  // 基本的なトークン化
  const words = tokenize(text);
  const uniqueWords = [...new Set(words)];
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);

  // レベル分布を計算
  const levelDistribution = analyzeLevelDistribution(uniqueWords);
  const totalCategorized =
    levelDistribution.A1 +
    levelDistribution.A2 +
    levelDistribution.B1 +
    levelDistribution.B2 +
    levelDistribution.C1 +
    levelDistribution.C2;

  // 各レベルの割合
  const basicRatio =
    totalCategorized > 0
      ? (levelDistribution.A1 + levelDistribution.A2 + levelDistribution.B1) /
        totalCategorized
      : 0;
  const intermediateRatio =
    totalCategorized > 0 ? levelDistribution.B2 / totalCategorized : 0;
  const advancedRatio =
    totalCategorized > 0
      ? (levelDistribution.C1 + levelDistribution.C2) / totalCategorized
      : 0;

  // 構造分析
  const avgSentenceLength = calculateAverageSentenceLength(sentences, words);
  const avgWordLength = calculateAverageWordLength(words);
  const longSentences = sentences.filter(
    (s) => tokenize(s).length >= 20,
  ).length;
  const longSentenceRatio =
    sentences.length > 0 ? longSentences / sentences.length : 0;
  const complexPunctRatio = calculateComplexPunctuation(text);
  const passiveRatio = estimatePassiveVoice(text);

  // 難しい単語を抽出
  const difficultWords = extractDifficultWords(uniqueWords);
  const academicCount = uniqueWords.filter(isAcademicWord).length;
  const unknownCount = uniqueWords.filter((w) => !userKnownWords.has(w)).length;

  // 総合スコアを計算
  // 各要素に重み付け
  const vocabScore = advancedRatio * 40 + intermediateRatio * 20;
  const structureScore =
    (avgSentenceLength / 30) * 20 + // 平均文長（30語を上限）
    longSentenceRatio * 10 +
    complexPunctRatio * 5 +
    passiveRatio * 5;

  const overallScore = Math.min(100, Math.round(vocabScore + structureScore));
  const cefrLevel = scoreToCEFR(overallScore);

  // Flesch-Kincaid風の可読性スコア（簡易版）
  const readabilityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        206.835 - 1.015 * avgSentenceLength - 84.6 * (avgWordLength / 5),
      ),
    ),
  );

  // 推奨情報
  const targetAudience = getTargetAudience(cefrLevel);
  const readingTime = estimateReadingTime(words.length, overallScore);
  const suggestedPreparation = getSuggestedPreparation(
    cefrLevel,
    difficultWords,
  );

  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,

    overallScore,
    cefrLevel,
    readabilityScore,

    vocabularyAnalysis: {
      basicWordsRatio: basicRatio,
      intermediateWordsRatio: intermediateRatio,
      advancedWordsRatio: advancedRatio,
      unknownWordsCount: unknownCount,
      academicWordsCount: academicCount,
      difficultWords,
    },

    structureAnalysis: {
      averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      averageWordLength: Math.round(avgWordLength * 10) / 10,
      longSentenceRatio: Math.round(longSentenceRatio * 100) / 100,
      complexPunctuationRatio: Math.round(complexPunctRatio * 100) / 100,
      passiveVoiceEstimate: Math.round(passiveRatio * 100) / 100,
    },

    recommendations: {
      targetAudience,
      estimatedReadingTime: readingTime,
      suggestedPreparation,
    },
  };
}

/**
 * 対象読者を取得
 */
function getTargetAudience(level: CEFRLevel): string {
  const audiences: Record<CEFRLevel, string> = {
    A1: "英語初心者（英検5級程度）",
    A2: "基礎英語学習者（英検4-3級程度）",
    B1: "中級英語学習者（英検準2級程度）",
    B2: "上級英語学習者（英検2-準1級程度）",
    C1: "準ネイティブレベル（英検1級程度）",
    C2: "ネイティブレベル",
  };
  return audiences[level];
}

/**
 * 学習準備の提案
 */
function getSuggestedPreparation(
  level: CEFRLevel,
  difficultWords: WordDifficultyInfo[],
): string[] {
  const suggestions: string[] = [];

  if (level === "C1" || level === "C2") {
    suggestions.push("記事内の高度な語彙を事前に確認することをお勧めします");
  }

  if (difficultWords.length > 10) {
    suggestions.push(
      `${difficultWords.length}個の難しい単語が含まれています。単語帳に追加して学習しましょう`,
    );
  }

  if (level === "B2" || level === "C1") {
    suggestions.push("複雑な文構造に注意して読み進めましょう");
  }

  if (difficultWords.some((w) => w.isAcademic)) {
    suggestions.push(
      "学術的な表現が含まれています。専門用語に注意してください",
    );
  }

  return suggestions;
}

/**
 * 記事をユーザーレベルに適合するかチェック
 */
export function isArticleSuitableForLevel(
  articleLevel: CEFRLevel,
  userLevel: CEFRLevel,
): { suitable: boolean; reason: string } {
  const levelOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const articleIndex = levelOrder.indexOf(articleLevel);
  const userIndex = levelOrder.indexOf(userLevel);

  const diff = articleIndex - userIndex;

  if (diff <= 0) {
    return {
      suitable: true,
      reason: "この記事はあなたのレベルに適しています",
    };
  } else if (diff === 1) {
    return {
      suitable: true,
      reason: "少し挑戦的ですが、良い学習機会になります",
    };
  } else if (diff === 2) {
    return {
      suitable: false,
      reason:
        "この記事はやや難しいかもしれません。基礎を固めてから挑戦しましょう",
    };
  } else {
    return {
      suitable: false,
      reason:
        "この記事は現在のレベルには難しすぎます。より簡単な記事から始めましょう",
    };
  }
}

/**
 * 複数記事の難易度でソート
 */
export function sortArticlesByDifficulty<T extends { content: string }>(
  articles: T[],
  order: "asc" | "desc" = "asc",
): Array<T & { difficulty: ArticleDifficultyResult }> {
  const analyzed = articles.map((article) => ({
    ...article,
    difficulty: analyzeArticleDifficulty(article.content),
  }));

  return analyzed.sort((a, b) => {
    const diff = a.difficulty.overallScore - b.difficulty.overallScore;
    return order === "asc" ? diff : -diff;
  });
}

/**
 * ユーザーレベルに適した記事をフィルタリング
 */
export function filterArticlesByLevel<T extends { content: string }>(
  articles: T[],
  userLevel: CEFRLevel,
  tolerance: number = 1, // レベル差の許容範囲
): T[] {
  const levelOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userIndex = levelOrder.indexOf(userLevel);
  const minIndex = Math.max(0, userIndex - 1);
  const maxIndex = Math.min(levelOrder.length - 1, userIndex + tolerance);

  return articles.filter((article) => {
    const result = analyzeArticleDifficulty(article.content);
    const articleIndex = levelOrder.indexOf(result.cefrLevel);
    return articleIndex >= minIndex && articleIndex <= maxIndex;
  });
}
