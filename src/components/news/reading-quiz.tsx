"use client";

import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";

// ========================================
// 型定義
// ========================================

interface QuizQuestion {
  id: string;
  type: "vocabulary" | "comprehension";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface ReadingQuizProps {
  articleTitle: string;
  learnedWords: string[];
  onComplete?: (score: number, total: number) => void;
  onRetry?: () => void;
}

// ========================================
// メインコンポーネント
// ========================================

export function ReadingQuiz({
  articleTitle,
  learnedWords,
  onComplete,
  onRetry,
}: ReadingQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // 問題を生成
  const questions = useMemo(() => {
    return generateQuestions(learnedWords);
  }, [learnedWords]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;

  // 回答を確認
  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    setAnswers((prev) => [...prev, selectedAnswer]);
  };

  // 次の問題へ
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // クイズ完了
      setIsComplete(true);
      const correctCount = [...answers, selectedAnswer].filter(
        (a, i) => a === questions[i]?.correctIndex
      ).length;
      onComplete?.(correctCount, questions.length);
    }
  };

  // リトライ
  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setIsComplete(false);
    onRetry?.();
  };

  if (questions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">単語を追加するとクイズが表示されます</p>
      </div>
    );
  }

  // 完了画面
  if (isComplete) {
    const correctCount = answers.filter(
      (a, i) => a === questions[i]?.correctIndex
    ).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
        <Trophy
          className={`w-16 h-16 mx-auto mb-4 ${
            percentage >= 80
              ? "text-yellow-500"
              : percentage >= 60
              ? "text-gray-400"
              : "text-orange-400"
          }`}
        />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">クイズ完了！</h3>
        <p className="text-4xl font-bold text-blue-600 mb-2">
          {correctCount}/{questions.length}
        </p>
        <p className="text-gray-600 mb-6">正解率: {percentage}%</p>

        {percentage >= 80 && (
          <p className="text-green-600 font-medium mb-4">
            素晴らしい！よく理解できています 🎉
          </p>
        )}
        {percentage >= 60 && percentage < 80 && (
          <p className="text-blue-600 font-medium mb-4">
            良い調子です！もう少し練習しましょう 💪
          </p>
        )}
        {percentage < 60 && (
          <p className="text-orange-600 font-medium mb-4">
            復習が必要かもしれません 📚
          </p>
        )}

        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          もう一度挑戦
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">読解クイズ</h3>
          <span className="text-sm opacity-90">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        {/* プログレスバー */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 問題 */}
      <div className="p-6">
        <p className="text-lg font-medium text-gray-900 mb-6">
          {currentQuestion.question}
        </p>

        {/* 選択肢 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === currentQuestion.correctIndex;

            let bgColor = "bg-gray-50 hover:bg-gray-100";
            let borderColor = "border-gray-200";
            let textColor = "text-gray-700";

            if (showResult) {
              if (isCorrectOption) {
                bgColor = "bg-green-50";
                borderColor = "border-green-500";
                textColor = "text-green-700";
              } else if (isSelected && !isCorrectOption) {
                bgColor = "bg-red-50";
                borderColor = "border-red-500";
                textColor = "text-red-700";
              }
            } else if (isSelected) {
              bgColor = "bg-blue-50";
              borderColor = "border-blue-500";
              textColor = "text-blue-700";
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={`
                  w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${bgColor} ${borderColor} ${textColor}
                  ${!showResult ? "cursor-pointer" : "cursor-default"}
                `}
              >
                <span
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                    ${
                      isSelected || (showResult && isCorrectOption)
                        ? borderColor
                        : "border-gray-300"
                    }
                  `}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-left">{option}</span>
                {showResult && isCorrectOption && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* 解説 */}
        {showResult && currentQuestion.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>解説:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* ボタン */}
        <div className="mt-6 flex justify-end">
          {!showResult ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              回答を確認
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentIndex < questions.length - 1 ? "次の問題" : "結果を見る"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// 問題生成
// ========================================

function generateQuestions(words: string[]): QuizQuestion[] {
  if (words.length === 0) return [];

  const questions: QuizQuestion[] = [];

  // 単語の意味を問う問題（最大5問）
  const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 5);

  for (const word of shuffledWords) {
    questions.push({
      id: `vocab-${word}`,
      type: "vocabulary",
      question: `「${word}」の意味として最も適切なものは？`,
      options: generateOptions(word),
      correctIndex: 0, // 最初のオプションが正解（シャッフル後）
      explanation: `「${word}」は記事で学んだ重要な単語です。`,
    });
  }

  // オプションをシャッフル
  for (const q of questions) {
    const correctOption = q.options[q.correctIndex];
    q.options = q.options.sort(() => Math.random() - 0.5);
    q.correctIndex = q.options.indexOf(correctOption);
  }

  return questions;
}

function generateOptions(word: string): string[] {
  // 実際のアプリでは辞書APIから取得
  // ここではダミーのオプションを生成
  const dummyOptions = [
    "正しい意味（実装時にAPIから取得）",
    "誤った意味1",
    "誤った意味2",
    "誤った意味3",
  ];
  return dummyOptions;
}
