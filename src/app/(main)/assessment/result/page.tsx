"use client";

import {
  BookOpen,
  Home,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

const CEFR_LEVELS = [
  { level: "A1", label: "入門", color: "bg-emerald-500", minScore: 0 },
  { level: "A2", label: "初級", color: "bg-teal-500", minScore: 20 },
  { level: "B1", label: "中級", color: "bg-cyan-500", minScore: 40 },
  { level: "B2", label: "中上級", color: "bg-blue-500", minScore: 60 },
  { level: "C1", label: "上級", color: "bg-indigo-500", minScore: 80 },
  { level: "C2", label: "ネイティブ級", color: "bg-purple-500", minScore: 95 },
];

function getCEFRLevel(score: number) {
  for (let i = CEFR_LEVELS.length - 1; i >= 0; i--) {
    if (score >= CEFR_LEVELS[i].minScore) {
      return CEFR_LEVELS[i];
    }
  }
  return CEFR_LEVELS[0];
}

function AssessmentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") || "vocabulary";
  // スラングテストからのスコアも取得
  const slangScore = searchParams.get("slangScore");
  const regularScore = searchParams.get("score");
  const score = parseInt(slangScore || regularScore || "0", 10);
  const language = searchParams.get("lang") || "english";

  // スラングテスト結果の追加情報
  const slangLevel = searchParams.get("slangLevel");
  const correctCount = searchParams.get("correct");
  const totalCount = searchParams.get("total");
  const isSlangTest = !!slangScore;

  const cefrLevel = getCEFRLevel(score);

  const handleRetake = () => {
    router.push(`/assessment/vocabulary?lang=${language}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Result Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center mb-8">
          {/* Trophy Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">診断完了！</h1>
          <p className="text-slate-400 mb-8">
            {isSlangTest
              ? "スラング理解度テスト"
              : type === "vocabulary"
                ? "語彙テスト"
                : "読解テスト"}
            の結果
          </p>

          {/* Score Display */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-white mb-2">{score}%</div>
            {isSlangTest ? (
              <div className="space-y-2">
                <div
                  className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                    slangLevel === "NATIVE"
                      ? "bg-purple-500"
                      : slangLevel === "ADVANCED"
                        ? "bg-blue-500"
                        : slangLevel === "INTERMEDIATE"
                          ? "bg-cyan-500"
                          : slangLevel === "BASIC"
                            ? "bg-emerald-500"
                            : "bg-slate-500"
                  }`}
                >
                  {slangLevel === "NATIVE"
                    ? "🔥 ネイティブ級"
                    : slangLevel === "ADVANCED"
                      ? "⭐ 上級"
                      : slangLevel === "INTERMEDIATE"
                        ? "📚 中級"
                        : slangLevel === "BASIC"
                          ? "🌱 初級"
                          : "入門"}
                </div>
                {correctCount && totalCount && (
                  <p className="text-slate-400 text-sm">
                    {correctCount} / {totalCount} 問正解
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`inline-block px-4 py-2 ${cefrLevel.color} rounded-full text-white font-semibold`}
              >
                {cefrLevel.level} - {cefrLevel.label}
              </div>
            )}
          </div>

          {/* Score Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              {CEFR_LEVELS.map((l) => (
                <span key={l.level}>{l.level}</span>
              ))}
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Analysis Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">強み</h3>
            </div>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• 基本的な語彙の理解が良好</li>
              <li>• 文脈からの意味推測能力</li>
              <li>• 同義語の認識力</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">改善点</h3>
            </div>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• 高度な学術語彙の強化</li>
              <li>• イディオム表現の習得</li>
              <li>• 語源学習による語彙拡大</li>
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              おすすめ学習プラン
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mt-0.5">
                1
              </div>
              <div>
                <p className="text-white font-medium">
                  ニュース記事から始めよう
                </p>
                <p className="text-slate-400 text-sm">
                  {cefrLevel.level}
                  レベルに合った記事を毎日1本読んで語彙を増やしましょう
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center mt-0.5">
                2
              </div>
              <div>
                <p className="text-white font-medium">フラッシュカードで復習</p>
                <p className="text-slate-400 text-sm">
                  記事から学んだ単語をフラッシュカードで毎日復習しましょう
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mt-0.5">
                3
              </div>
              <div>
                <p className="text-white font-medium">2週間後に再診断</p>
                <p className="text-slate-400 text-sm">
                  継続的な学習後、レベルアップを確認しましょう
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetake}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 h-auto bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            もう一度テスト
          </Button>
          <Button
            asChild
            className="h-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all"
          >
            <Link href="/news">
              <BookOpen className="w-5 h-5" />
              ニュースで学習開始
            </Link>
          </Button>
          <Button
            asChild
            className="h-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all border-0"
          >
            <Link href="/">
              <Home className="w-5 h-5" />
              ホームへ
            </Link>
          </Button>
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

export default function AssessmentResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssessmentResultContent />
    </Suspense>
  );
}
