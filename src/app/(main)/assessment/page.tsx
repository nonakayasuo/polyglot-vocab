"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  ChevronRight,
  Globe,
  Sparkles,
  Target,
} from "lucide-react";

type Language =
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "chinese"
  | "korean";

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

  const [testType, setTestType] = useState<"vocabulary" | "reading" | "both">(
    "both"
  );

  const handleStartTest = () => {
    if (testType === "reading") {
      router.push(`/assessment/reading?lang=${selectedLanguage}`);
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
            語彙テストと読解テストで、CEFRレベル（A1〜C2）を判定します。
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
              <button
                key={lang.value}
                onClick={() => setSelectedLanguage(lang.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedLanguage === lang.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                }`}
              >
                <span className="text-3xl mb-2 block">{lang.flag}</span>
                <span className="text-white font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Test Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">語彙テスト</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              単語の意味、類義語、反義語などを問う問題です。
              正解すると難しい問題が、不正解だと簡単な問題が出題される適応型テストです。
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
              ニュース記事を読んで、内容理解を確認する問題です。
              記事の難易度が段階的に上がっていきます。
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>3〜5記事</span>
              <span>•</span>
              <span>10〜15分</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartTest}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            <Sparkles className="w-5 h-5" />
            診断を開始する
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="mt-4 text-sm text-slate-500">所要時間: 約15〜25分</p>
        </div>
      </div>
    </div>
  );
}
