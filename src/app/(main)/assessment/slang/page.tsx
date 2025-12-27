"use client";

import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface SlangQuestion {
  id: string;
  word: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
  register: string;
  explanation: string;
}

// サンプルスラング問題（実際はAPIから取得）
const SAMPLE_SLANG_QUESTIONS: SlangQuestion[] = [
  {
    id: "1",
    word: "slay",
    question: '"She absolutely slayed at the event." の "slay" の意味は？',
    options: [
      "殺す",
      "圧倒的に素晴らしいパフォーマンスをする",
      "遅れる",
      "失敗する",
    ],
    correctIndex: 1,
    difficulty: "BASIC",
    register: "SLANG",
    explanation:
      "「slay」はSNSやカジュアルな会話で「最高のパフォーマンス」「圧倒的に素晴らしい」という意味で使われます。元々は「殺す」という意味ですが、スラングでは褒め言葉として使用されます。",
  },
  {
    id: "2",
    word: "no cap",
    question: '"That movie was fire, no cap." の "no cap" の意味は？',
    options: ["帽子なしで", "冗談で", "マジで、本当に", "少しだけ"],
    correctIndex: 2,
    difficulty: "INTERMEDIATE",
    register: "SLANG",
    explanation:
      "「no cap」は「嘘じゃない」「マジで」という意味のGen Zスラングです。「cap」は「嘘」を意味し、「no cap」は「嘘なしで＝本当に」となります。",
  },
  {
    id: "3",
    word: "lowkey",
    question: '"I\'m lowkey excited about this." の "lowkey" の意味は？',
    options: ["全く", "ちょっと、密かに", "とても", "絶対に"],
    correctIndex: 1,
    difficulty: "BASIC",
    register: "SLANG",
    explanation:
      "「lowkey」は「ちょっと」「控えめに」「密かに」という意味で使われます。反対語は「highkey」（とても、オープンに）です。",
  },
  {
    id: "4",
    word: "ghosting",
    question: '"He ghosted me after our date." の "ghosting" の意味は？',
    options: ["怖がらせる", "連絡を突然絶つ", "ついていく", "プレゼントを贈る"],
    correctIndex: 1,
    difficulty: "INTERMEDIATE",
    register: "SLANG",
    explanation:
      "「ghosting」は、返信せずに突然連絡を絶つことを意味します。特に恋愛やデートの文脈でよく使われます。",
  },
  {
    id: "5",
    word: "sus",
    question: '"That guy is acting sus." の "sus" の意味は？',
    options: ["かっこいい", "怪しい", "面白い", "普通の"],
    correctIndex: 1,
    difficulty: "BASIC",
    register: "SLANG",
    explanation:
      "「sus」は「suspicious（怪しい）」の略で、ゲーム「Among Us」の流行で広まりました。何かが怪しい、疑わしい時に使います。",
  },
  {
    id: "6",
    word: "GOAT",
    question: '"Michael Jordan is the GOAT." の "GOAT" の意味は？',
    options: ["ヤギ", "史上最高の人物", "古い選手", "引退した人"],
    correctIndex: 1,
    difficulty: "BASIC",
    register: "SLANG",
    explanation:
      "「GOAT」は「Greatest Of All Time（史上最高）」の頭文字を取ったものです。スポーツ選手やアーティストを褒める時によく使われます。",
  },
  {
    id: "7",
    word: "flex",
    question: '"He\'s always flexing his new car." の "flex" の意味は？',
    options: ["柔軟にする", "売る", "自慢する、見せびらかす", "修理する"],
    correctIndex: 2,
    difficulty: "INTERMEDIATE",
    register: "SLANG",
    explanation:
      "「flex」はスラングで「自慢する」「見せびらかす」という意味です。富や成功、所有物を誇示する行為を指します。",
  },
  {
    id: "8",
    word: "lit",
    question: '"The party was lit!" の "lit" の意味は？',
    options: [
      "照明がついている",
      "最高に楽しい、盛り上がっている",
      "静かな",
      "つまらない",
    ],
    correctIndex: 1,
    difficulty: "BASIC",
    register: "SLANG",
    explanation:
      "「lit」はパーティーやイベントが「最高」「盛り上がっている」という意味で使われます。元々は「酔っている」という意味もあります。",
  },
];

function SlangTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || "english";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedIdx: number; isCorrect: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const questions = SAMPLE_SLANG_QUESTIONS;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectOption = useCallback(
    (index: number) => {
      if (showResult) return;
      setSelectedOption(index);
    },
    [showResult],
  );

  const handleSubmitAnswer = useCallback(() => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedIdx: selectedOption,
        isCorrect,
      },
    ]);

    setShowResult(true);
  }, [selectedOption, currentQuestion.correctIndex, currentQuestion.id]);

  const finishTest = useCallback(async () => {
    setIsLoading(true);

    try {
      const correctCount =
        answers.filter((a) => a.isCorrect).length +
        (selectedOption === currentQuestion.correctIndex ? 1 : 0);
      const totalCount = questions.length;
      const score = (correctCount / totalCount) * 100;

      // スラングレベルを計算
      let slangLevel = "NONE";
      if (score >= 90) slangLevel = "NATIVE";
      else if (score >= 75) slangLevel = "ADVANCED";
      else if (score >= 50) slangLevel = "INTERMEDIATE";
      else if (score >= 25) slangLevel = "BASIC";

      // 結果をURLパラメータで渡す
      const resultParams = new URLSearchParams({
        lang,
        slangScore: score.toString(),
        slangLevel,
        correct: correctCount.toString(),
        total: totalCount.toString(),
      });

      router.push(`/assessment/result?${resultParams.toString()}`);
    } catch (error) {
      console.error("Failed to save slang test result:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    answers,
    selectedOption,
    currentQuestion.correctIndex,
    questions.length,
    lang,
    router,
  ]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // テスト終了 - 結果を保存して結果ページへ
      finishTest();
    }
  }, [currentIndex, questions.length, finishTest]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") {
        const index = parseInt(e.key, 10) - 1;
        if (index < currentQuestion.options.length) {
          handleSelectOption(index);
        }
      } else if (e.key === "Enter" && selectedOption !== null) {
        if (showResult) {
          handleNextQuestion();
        } else {
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedOption,
    showResult,
    currentQuestion,
    handleNextQuestion,
    handleSelectOption,
    handleSubmitAnswer,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white text-lg">結果を計算中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-white font-medium">
                スラング理解度テスト
              </span>
            </div>
            <span className="text-slate-400 text-sm">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 mb-6">
          {/* Word Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
              {currentQuestion.register}
            </span>
            <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Word Display */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">
              {currentQuestion.word}
            </span>
          </div>

          {/* Question */}
          <p className="text-xl text-slate-200 mb-8">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrectness = showResult;

              let optionClass =
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 h-auto";

              if (showCorrectness) {
                if (isCorrect) {
                  optionClass +=
                    " border-green-500 bg-green-500/20 text-green-300";
                } else if (isSelected && !isCorrect) {
                  optionClass += " border-red-500 bg-red-500/20 text-red-300";
                } else {
                  optionClass +=
                    " border-slate-600 bg-slate-700/30 text-slate-400";
                }
              } else {
                if (isSelected) {
                  optionClass +=
                    " border-orange-500 bg-orange-500/20 text-white";
                } else {
                  optionClass +=
                    " border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50";
                }
              }

              return (
                <Button
                  key={`${currentQuestion.id}-option-${index}`}
                  variant="ghost"
                  onClick={() => handleSelectOption(index)}
                  disabled={showResult}
                  className={optionClass}
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrectness && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="mt-6 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">解説</p>
                  <p className="text-slate-300 text-sm">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="px-8 py-3 h-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl"
            >
              回答する
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="px-8 py-3 h-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  次の問題
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                "結果を見る"
              )}
            </Button>
          )}
        </div>

        {/* Keyboard Hint */}
        <p className="text-center text-slate-500 text-sm mt-6">
          キーボードショートカット: 1-4で選択、Enterで決定
        </p>
      </div>
    </div>
  );
}

export default function SlangTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      }
    >
      <SlangTestContent />
    </Suspense>
  );
}
