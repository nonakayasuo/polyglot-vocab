"use client";

import {
  BookOpen,
  Brain,
  ChevronRight,
  Flame,
  Globe,
  Sparkles,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Language =
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "chinese"
  | "korean";

type TestType = "standard" | "slang" | "full";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "english", label: "英語", flag: "🇬🇧" },
  { value: "spanish", label: "スペイン語", flag: "🇪🇸" },
  { value: "french", label: "フランス語", flag: "🇫🇷" },
  { value: "german", label: "ドイツ語", flag: "🇩🇪" },
  { value: "chinese", label: "中国語", flag: "🇨🇳" },
  { value: "korean", label: "韓国語", flag: "🇰🇷" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("english");
  const [testType, setTestType] = useState<TestType>("standard");

  const handleStartTest = () => {
    if (testType === "slang") {
      router.push(`/assessment/slang?lang=${selectedLanguage}`);
    } else {
      router.push(`/assessment/vocabulary?lang=${selectedLanguage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            レベル診断テスト
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            あなたの語学レベルを診断し、最適な学習プランをご提案します。
            <br />
            CEFRレベル（A1〜C2）とスラング理解度を判定します。
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">
              診断する言語を選択
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.value}
                variant="ghost"
                onClick={() => setSelectedLanguage(lang.value)}
                className={`h-auto p-4 rounded-xl border-2 transition-all flex flex-col items-center ${
                  selectedLanguage === lang.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                }`}
              >
                <span className="text-3xl mb-2 block">{lang.flag}</span>
                <span className="text-white font-medium">{lang.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Test Type Selection */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            テストの種類を選択
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Standard Test */}
            <Button
              variant="ghost"
              onClick={() => setTestType("standard")}
              className={`h-auto p-6 rounded-xl border-2 text-left transition-all flex flex-col items-start ${
                testType === "standard"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                標準テスト
              </h3>
              <p className="text-slate-400 text-sm mb-3">
                語彙テストと読解テストでCEFRレベルを判定
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>約15〜20分</span>
              </div>
            </Button>

            {/* Slang Test */}
            <Button
              variant="ghost"
              onClick={() => setTestType("slang")}
              className={`h-auto p-6 rounded-xl border-2 text-left transition-all flex flex-col items-start ${
                testType === "slang"
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                  NEW
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                スラングテスト
              </h3>
              <p className="text-slate-400 text-sm mb-3">
                SNS・口語表現の理解度をテスト
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>約5〜10分</span>
              </div>
            </Button>

            {/* Full Test */}
            <Button
              variant="ghost"
              onClick={() => setTestType("full")}
              className={`h-auto p-6 rounded-xl border-2 text-left transition-all flex flex-col items-start ${
                testType === "full"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                フルテスト
              </h3>
              <p className="text-slate-400 text-sm mb-3">
                CEFR + スラング理解度を総合判定
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>約25〜30分</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Test Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">語彙テスト</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              単語の意味、類義語、反義語などを問う適応型テスト
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>約20問</span>
              <span>•</span>
              <span>5〜10分</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">読解テスト</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              ニュース記事を読んで内容理解を確認
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>3〜5記事</span>
              <span>•</span>
              <span>10〜15分</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-orange-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">スラング</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              SNS・ミーム・口語表現の理解度テスト
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>約10問</span>
              <span>•</span>
              <span>5分</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleStartTest}
            className={`inline-flex items-center gap-3 px-8 py-4 h-auto font-semibold rounded-xl transition-all shadow-lg ${
              testType === "slang"
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/25"
                : testType === "full"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/25"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/25"
            } text-white`}
          >
            <Sparkles className="w-5 h-5" />
            {testType === "slang"
              ? "スラングテストを開始"
              : testType === "full"
                ? "フルテストを開始"
                : "診断を開始する"}
            <ChevronRight className="w-5 h-5" />
          </Button>
          <p className="mt-4 text-sm text-slate-500">
            所要時間: 約
            {testType === "slang"
              ? "5〜10分"
              : testType === "full"
                ? "25〜30分"
                : "15〜20分"}
          </p>
        </div>
      </div>
    </div>
  );
}
