"use client";

import {
  Brain,
  CheckCircle,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// サンプルの語彙問題（後でAPIから取得）
const SAMPLE_QUESTIONS = {
  english: [
    {
      id: "1",
      cefrLevel: "A2",
      word: "abundant",
      question: 'What does "abundant" mean?',
      options: ["少ない", "豊富な", "高価な", "古い"],
      correctIndex: 1,
      explanation: '"abundant" は「豊富な、たくさんの」という意味です。',
    },
    {
      id: "2",
      cefrLevel: "B1",
      word: "resilient",
      question: 'Choose the synonym of "resilient":',
      options: ["fragile", "flexible", "rigid", "weak"],
      correctIndex: 1,
      explanation:
        '"resilient" は「回復力のある、弾力のある」という意味で、"flexible" が最も近い意味です。',
    },
    {
      id: "3",
      cefrLevel: "B2",
      word: "meticulous",
      question: 'What does "meticulous" mean?',
      options: ["careless", "quick", "very careful", "lazy"],
      correctIndex: 2,
      explanation:
        '"meticulous" は「細心の注意を払う、綿密な」という意味です。',
    },
    {
      id: "4",
      cefrLevel: "B2",
      word: "ubiquitous",
      question: '"Smartphones have become _____ in modern society."',
      options: ["rare", "ubiquitous", "obsolete", "expensive"],
      correctIndex: 1,
      explanation: '"ubiquitous" は「至る所にある、遍在する」という意味です。',
    },
    {
      id: "5",
      cefrLevel: "C1",
      word: "ephemeral",
      question: 'What is the opposite of "ephemeral"?',
      options: ["temporary", "permanent", "brief", "fleeting"],
      correctIndex: 1,
      explanation:
        '"ephemeral" は「つかの間の、短命な」という意味なので、反対は "permanent"（永続的な）です。',
    },
  ],
};

type QuestionState = "answering" | "correct" | "incorrect";

function VocabularyTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = searchParams.get("lang") || "english";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionState, setQuestionState] =
    useState<QuestionState>("answering");
  const [answers, setAnswers] = useState<
    { questionId: string; isCorrect: boolean; time: number }[]
  >([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, _setIsLoading] = useState(false);

  const questions =
    SAMPLE_QUESTIONS[language as keyof typeof SAMPLE_QUESTIONS] ||
    SAMPLE_QUESTIONS.english;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleOptionSelect = useCallback(
    (index: number) => {
      if (questionState !== "answering") return;
      setSelectedOption(index);
    },
    [questionState],
  );

  const handleSubmit = useCallback(() => {
    if (selectedOption === null || questionState !== "answering") return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const responseTime = Date.now() - startTime;

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, isCorrect, time: responseTime },
    ]);
    setQuestionState(isCorrect ? "correct" : "incorrect");
  }, [selectedOption, questionState, currentQuestion, startTime]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuestionState("answering");
      setStartTime(Date.now());
    } else {
      // テスト完了 - 結果ページへ
      const correctCount =
        answers.filter((a) => a.isCorrect).length +
        (questionState === "correct" ? 1 : 0);
      const score = Math.round((correctCount / questions.length) * 100);
      router.push(
        `/assessment/result?type=vocabulary&score=${score}&lang=${language}`,
      );
    }
  }, [
    currentIndex,
    questions.length,
    answers,
    questionState,
    router,
    language,
  ]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (questionState === "answering") {
        if (e.key >= "1" && e.key <= "4") {
          handleOptionSelect(parseInt(e.key, 10) - 1);
        } else if (e.key === "Enter" && selectedOption !== null) {
          handleSubmit();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    questionState,
    selectedOption,
    handleSubmit,
    handleNext,
    handleOptionSelect,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Brain className="w-5 h-5" />
              <span>語彙テスト</span>
            </div>
            <span className="text-slate-400">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 mb-6">
          {/* CEFR Level Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
              {currentQuestion.cefrLevel}
            </span>
            <span className="text-slate-500 text-sm">
              {currentQuestion.word}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-white mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              let optionClass =
                "border-slate-600 bg-slate-700/30 hover:border-slate-500";

              if (questionState !== "answering") {
                if (optionIndex === currentQuestion.correctIndex) {
                  optionClass = "border-emerald-500 bg-emerald-500/20";
                } else if (
                  optionIndex === selectedOption &&
                  !questionState.includes("correct")
                ) {
                  optionClass = "border-red-500 bg-red-500/20";
                }
              } else if (selectedOption === optionIndex) {
                optionClass = "border-emerald-500 bg-emerald-500/10";
              }

              return (
                <Button
                  key={`${currentQuestion.word}-${option}`}
                  variant="ghost"
                  onClick={() => handleOptionSelect(optionIndex)}
                  disabled={questionState !== "answering"}
                  className={`w-full h-auto p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 justify-start ${optionClass}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center text-slate-300 font-medium">
                    {optionIndex + 1}
                  </span>
                  <span className="text-white flex-1">{option}</span>
                  {questionState !== "answering" &&
                    optionIndex === currentQuestion.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  {questionState !== "answering" &&
                    optionIndex === selectedOption &&
                    optionIndex !== currentQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                </Button>
              );
            })}
          </div>

          {/* Explanation (shown after answering) */}
          {questionState !== "answering" && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                questionState === "correct"
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {questionState === "correct" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-emerald-400">正解！</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="font-medium text-red-400">不正解</span>
                  </>
                )}
              </div>
              <p className="text-slate-300 text-sm">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          {questionState === "answering" ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-6 py-3 h-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              回答する
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="px-6 py-3 h-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  次の問題
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                "結果を見る"
              )}
            </Button>
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <span className="inline-flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">1-4</kbd>
            で選択
            <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Enter</kbd>
            で決定
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  );
}

export default function VocabularyTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VocabularyTestContent />
    </Suspense>
  );
}
