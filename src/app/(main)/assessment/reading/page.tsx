"use client";

import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

// サンプルの読解問題（後でAPIから取得）
const SAMPLE_READING_QUESTIONS = {
  english: [
    {
      id: "1",
      cefrLevel: "B1",
      title: "Tech Giants Report Strong Earnings",
      content: `Major technology companies have reported better-than-expected quarterly earnings, 
      with revenue growth driven by cloud computing and artificial intelligence services. 
      Analysts note that consumer spending on tech products remains stable despite economic 
      uncertainties. The strong performance has boosted investor confidence in the sector.`,
      questions: [
        {
          question: "What drove the revenue growth for tech companies?",
          options: [
            "Social media advertising",
            "Cloud computing and AI services",
            "Hardware sales",
            "Gaming revenue",
          ],
          correctIndex: 1,
        },
        {
          question:
            "How has consumer spending on tech products been described?",
          options: [
            "Declining rapidly",
            "Unstable",
            "Stable",
            "Growing significantly",
          ],
          correctIndex: 2,
        },
        {
          question: "What effect did the strong performance have?",
          options: [
            "Decreased stock prices",
            "Boosted investor confidence",
            "Led to layoffs",
            "Caused market volatility",
          ],
          correctIndex: 1,
        },
      ],
      source: "NewsLingua Sample",
    },
    {
      id: "2",
      cefrLevel: "B2",
      title: "Climate Summit Reaches Historic Agreement",
      content: `World leaders have reached a landmark agreement at the annual climate summit, 
      committing to ambitious targets for reducing carbon emissions by 2035. The deal includes 
      provisions for financial support to developing nations and mechanisms for accountability. 
      Environmental groups have cautiously welcomed the agreement while emphasizing the need 
      for swift implementation. Critics argue that the targets, while ambitious, may not be 
      sufficient to limit global warming to 1.5 degrees Celsius.`,
      questions: [
        {
          question: "What is the target year for reducing carbon emissions?",
          options: ["2030", "2035", "2040", "2050"],
          correctIndex: 1,
        },
        {
          question: "What does the deal include for developing nations?",
          options: [
            "Trade sanctions",
            "Financial support",
            "Technology restrictions",
            "Immigration policies",
          ],
          correctIndex: 1,
        },
        {
          question: "What concern do critics have about the agreement?",
          options: [
            "It's too expensive",
            "Targets may not be sufficient",
            "It excludes major countries",
            "Implementation is too fast",
          ],
          correctIndex: 1,
        },
      ],
      source: "NewsLingua Sample",
    },
  ],
};

function ReadingTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = searchParams.get("lang") || "english";

  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [startTime] = useState<number>(Date.now());

  const articles =
    SAMPLE_READING_QUESTIONS[
      language as keyof typeof SAMPLE_READING_QUESTIONS
    ] || SAMPLE_READING_QUESTIONS.english;
  const currentArticle = articles[currentArticleIndex];
  const currentQuestion = currentArticle.questions[currentQuestionIndex];
  const totalQuestions = articles.reduce(
    (sum, a) => sum + a.questions.length,
    0,
  );
  const answeredQuestions = answers.length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setAnswers((prev) => [...prev, isCorrect]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentArticle.questions.length - 1) {
      // 次の問題へ
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentArticleIndex < articles.length - 1) {
      // 次の記事へ
      setCurrentArticleIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // テスト完了
      const correctCount =
        answers.filter(Boolean).length +
        (selectedOption === currentQuestion.correctIndex ? 1 : 0);
      const score = Math.round((correctCount / totalQuestions) * 100);
      router.push(
        `/assessment/result?type=reading&score=${score}&lang=${language}`,
      );
      return;
    }
    setSelectedOption(null);
    setShowResult(false);
  };

  const readingTime = Math.round((Date.now() - startTime) / 1000 / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <BookOpen className="w-5 h-5" />
              <span>読解テスト</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime}分
              </span>
              <span className="text-slate-400">
                {answeredQuestions + 1} / {totalQuestions}
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Article Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 mb-6">
          {/* Article Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
              {currentArticle.cefrLevel}
            </span>
            <span className="text-slate-500 text-sm">
              {currentArticle.source}
            </span>
          </div>

          {/* Article Title */}
          <h2 className="text-xl font-bold text-white mb-4">
            {currentArticle.title}
          </h2>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {currentArticle.content}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 my-6" />

          {/* Question */}
          <div className="mb-6">
            <span className="text-sm text-slate-500 mb-2 block">
              問題 {currentQuestionIndex + 1} /{" "}
              {currentArticle.questions.length}
            </span>
            <h3 className="text-lg font-semibold text-white">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              let optionClass =
                "border-slate-600 bg-slate-700/30 hover:border-slate-500";

              if (showResult) {
                if (optionIndex === currentQuestion.correctIndex) {
                  optionClass = "border-emerald-500 bg-emerald-500/20";
                } else if (
                  optionIndex === selectedOption &&
                  optionIndex !== currentQuestion.correctIndex
                ) {
                  optionClass = "border-red-500 bg-red-500/20";
                }
              } else if (selectedOption === optionIndex) {
                optionClass = "border-blue-500 bg-blue-500/10";
              }

              return (
                <Button
                  key={`${currentQuestion.question}-${option}`}
                  variant="ghost"
                  onClick={() => handleOptionSelect(optionIndex)}
                  disabled={showResult}
                  className={`w-full h-auto p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 justify-start ${optionClass}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center text-slate-300 font-medium">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="text-white flex-1">{option}</span>
                  {showResult &&
                    optionIndex === currentQuestion.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  {showResult &&
                    optionIndex === selectedOption &&
                    optionIndex !== currentQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-6 py-3 h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              回答する
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="px-6 py-3 h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              {currentQuestionIndex < currentArticle.questions.length - 1 ||
              currentArticleIndex < articles.length - 1 ? (
                <>
                  次へ
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                "結果を見る"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );
}

export default function ReadingTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReadingTestContent />
    </Suspense>
  );
}
