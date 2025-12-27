/**
 * CEFRレベル算出アルゴリズム
 *
 * IRT (Item Response Theory) ベースの能力推定を実装
 */

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface TestResponse {
  questionId: string;
  isCorrect: boolean;
  difficulty: number; // 0-1スケール
  responseTime?: number; // ミリ秒
}

interface LevelAssessmentResult {
  cefrLevel: CEFRLevel;
  overallScore: number; // 0-100
  vocabularyScore: number;
  readingScore: number;
  confidence: number; // 信頼度 0-1
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// CEFRレベルと能力値のマッピング
const CEFR_THRESHOLDS = {
  A1: { min: 0, max: 20, label: "入門" },
  A2: { min: 20, max: 40, label: "初級" },
  B1: { min: 40, max: 55, label: "中級" },
  B2: { min: 55, max: 70, label: "中上級" },
  C1: { min: 70, max: 85, label: "上級" },
  C2: { min: 85, max: 100, label: "ネイティブ級" },
};

/**
 * スコアからCEFRレベルを算出
 */
export function scoreToLevel(score: number): CEFRLevel {
  if (score >= 85) return "C2";
  if (score >= 70) return "C1";
  if (score >= 55) return "B2";
  if (score >= 40) return "B1";
  if (score >= 20) return "A2";
  return "A1";
}

/**
 * IRTベースの能力推定（簡易版）
 *
 * @param responses テスト回答結果
 * @returns 推定能力値 (0-100)
 */
export function estimateAbility(responses: TestResponse[]): number {
  if (responses.length === 0) return 50;

  // 正解率ベースの基本スコア
  const correctCount = responses.filter((r) => r.isCorrect).length;
  const baseScore = (correctCount / responses.length) * 100;

  // 難易度重み付けスコア
  let weightedCorrect = 0;
  let totalWeight = 0;

  responses.forEach((response) => {
    // 難しい問題に正解するほど高得点
    const weight = 1 + response.difficulty;
    totalWeight += weight;

    if (response.isCorrect) {
      weightedCorrect += weight;
    }
  });

  const weightedScore = (weightedCorrect / totalWeight) * 100;

  // 基本スコアと重み付けスコアの平均
  return Math.round((baseScore * 0.4 + weightedScore * 0.6) * 10) / 10;
}

/**
 * 総合レベル判定
 */
export function calculateLevelAssessment(
  vocabularyResponses: TestResponse[],
  readingResponses: TestResponse[]
): LevelAssessmentResult {
  // 各テストのスコアを算出
  const vocabularyScore = estimateAbility(vocabularyResponses);
  const readingScore = estimateAbility(readingResponses);

  // 総合スコア（語彙40%、読解60%）
  const overallScore = Math.round(vocabularyScore * 0.4 + readingScore * 0.6);

  // CEFRレベル決定
  const cefrLevel = scoreToLevel(overallScore);

  // 信頼度の計算（回答数に基づく）
  const totalResponses = vocabularyResponses.length + readingResponses.length;
  const confidence = Math.min(totalResponses / 30, 1); // 30問で100%

  // 強み・弱み分析
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (vocabularyScore >= readingScore + 10) {
    strengths.push("語彙力が優れています");
    recommendations.push("読解力を伸ばすために、より長い記事に挑戦しましょう");
  } else if (readingScore >= vocabularyScore + 10) {
    strengths.push("読解力が優れています");
    recommendations.push(
      "語彙力を増やすために、単語帳での学習を強化しましょう"
    );
  } else {
    strengths.push("語彙力と読解力のバランスが取れています");
  }

  // レベル別のアドバイス
  switch (cefrLevel) {
    case "A1":
    case "A2":
      weaknesses.push("基礎語彙の強化が必要です");
      recommendations.push("BBC Learning Englishの初級記事から始めましょう");
      recommendations.push("毎日10単語を目標に学習しましょう");
      break;
    case "B1":
      weaknesses.push("中級語彙の習得が課題です");
      recommendations.push("ニュース記事を毎日1本読みましょう");
      recommendations.push("コロケーション（語の組み合わせ）に注目しましょう");
      break;
    case "B2":
      weaknesses.push("高度な表現の理解が課題です");
      recommendations.push("意見記事やオピニオンを読んでみましょう");
      recommendations.push("イディオム表現を積極的に学びましょう");
      break;
    case "C1":
    case "C2":
      strengths.push("高度な語彙力を持っています");
      recommendations.push("専門分野のニュースにも挑戦しましょう");
      recommendations.push("ニュアンスの違いに注目して学習しましょう");
      break;
  }

  return {
    cefrLevel,
    overallScore,
    vocabularyScore,
    readingScore,
    confidence,
    strengths,
    weaknesses,
    recommendations,
  };
}

/**
 * 難易度別の問題推奨
 */
export function getRecommendedDifficulty(
  currentScore: number,
  recentResponses: TestResponse[]
): number {
  // 直近5問の正答率を計算
  const recent = recentResponses.slice(-5);
  if (recent.length < 3) {
    // 回答数が少ない場合は現在のスコアベースで推奨
    return currentScore / 100;
  }

  const recentCorrectRate =
    recent.filter((r) => r.isCorrect).length / recent.length;

  // 適応型: 正答率が高ければ難易度UP、低ければDOWN
  if (recentCorrectRate >= 0.8) {
    return Math.min(currentScore / 100 + 0.1, 1);
  } else if (recentCorrectRate <= 0.4) {
    return Math.max(currentScore / 100 - 0.1, 0);
  }

  return currentScore / 100;
}
