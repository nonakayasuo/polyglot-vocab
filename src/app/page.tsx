"use client";

import {
  BookOpen,
  ChevronRight,
  Flame,
  Languages,
  Loader2,
  Newspaper,
  Settings,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DailyRecommendations from "@/components/DailyRecommendations";
import { StreakDisplay } from "@/components/gamification";
import ReadingStats from "@/components/ReadingStats";
import {
  fetchStats,
  type LanguageStats,
  type VocabularyStats,
} from "@/lib/api";
import { LANGUAGES, type Language } from "@/types/vocabulary";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [languageStats, setLanguageStats] = useState<
    Record<Language, LanguageStats>
  >({
    english: {
      total: 0,
      mastered: 0,
      notStarted: 0,
      byCategory: {},
    },
    spanish: {
      total: 0,
      mastered: 0,
      notStarted: 0,
      byCategory: {},
    },
    korean: {
      total: 0,
      mastered: 0,
      notStarted: 0,
      byCategory: {},
    },
    chinese: {
      total: 0,
      mastered: 0,
      notStarted: 0,
      byCategory: {},
    },
  });
  const [totalStats, setTotalStats] = useState({
    total: 0,
    mastered: 0,
    notStarted: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // 各言語の統計を並列取得
      const [english, spanish, korean, chinese, overall] = await Promise.all([
        fetchStats("english") as Promise<LanguageStats>,
        fetchStats("spanish") as Promise<LanguageStats>,
        fetchStats("korean") as Promise<LanguageStats>,
        fetchStats("chinese") as Promise<LanguageStats>,
        fetchStats() as Promise<VocabularyStats>,
      ]);

      setLanguageStats({
        english,
        spanish,
        korean,
        chinese,
      });

      setTotalStats({
        total: overall.total,
        mastered: overall.mastered,
        notStarted: overall.notStarted,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getProgressPercent = (stats: LanguageStats) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.mastered / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  NewsLingua
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
                  ニュースで学ぶ語彙
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StreakDisplay compact />
              <Link
                href="/settings"
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
          {/* 背景装飾 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8">
            {/* 左側: 挨拶とクイックアクション */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-300">今日も学習しましょう！</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                📰 ニュースで学ぶ
              </h2>
              <p className="text-slate-400 mb-6">
                世界のニュースを読みながら、実践的な語彙力を身につけよう
              </p>

              {/* クイックアクションボタン */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/news"
                  className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Newspaper className="w-4 h-4" />
                  ニュースを読む
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/assessment"
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur rounded-xl font-medium hover:bg-white/20 transition-all"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  レベル診断
                </Link>
              </div>
            </div>

            {/* 右側: ストリーク */}
            <div className="lg:pl-8">
              <StreakDisplay />
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="総単語数"
            value={totalStats.total}
            color="blue"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="習得済み"
            value={totalStats.mastered}
            color="emerald"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="学習中"
            value={totalStats.total - totalStats.mastered - totalStats.notStarted}
            color="amber"
          />
          <StatCard
            icon={<Languages className="w-5 h-5" />}
            label="未着手"
            value={totalStats.notStarted}
            color="slate"
          />
        </div>

        {/* 言語セクション */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-5 h-5 text-blue-500" />
              言語別単語帳
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LANGUAGES.map((lang, index) => {
              const stats = languageStats[lang.value];
              const progressPercent = getProgressPercent(stats);

              return (
                <Link
                  key={lang.value}
                  href={`/${lang.value}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* 背景グラデーション */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 opacity-50" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{lang.flag}</span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {lang.label}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {stats.total} 単語
                    </p>

                    {/* プログレスバー */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-10 text-right">
                        {progressPercent}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 今日のおすすめ単語 */}
        <section className="mb-8">
          <DailyRecommendations onWordAdded={loadData} />
        </section>

        {/* 読書統計 */}
        <section className="mb-8">
          <ReadingStats />
        </section>

        {/* クイックアクセス */}
        <section className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/news"
            className="group flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl hover:shadow-lg hover:shadow-blue-200/30 dark:hover:shadow-blue-900/30 transition-all duration-300"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                📰 News Reader
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                英語ニュースを読んで語彙を増やそう
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/assessment"
            className="group flex items-center gap-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl hover:shadow-lg hover:shadow-amber-200/30 dark:hover:shadow-amber-900/30 transition-all duration-300"
          >
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                🏆 レベル診断
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                あなたのCEFRレベルをチェック
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </section>

        {/* フッターヒント */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            毎日の学習で語彙力を伸ばそう
          </p>
        </footer>
      </main>
    </div>
  );
}

// 統計カードコンポーネント
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "emerald" | "amber" | "slate";
}) {
  const colorStyles = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-200/50 dark:border-blue-800/50",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-200/50 dark:border-emerald-800/50",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-200/50 dark:border-amber-800/50",
    slate: "from-slate-500/10 to-slate-500/5 border-slate-200/50 dark:border-slate-800/50",
  };

  const iconColors = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    slate: "text-slate-500",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorStyles[color]} border p-4`}>
      <div className={`mb-2 ${iconColors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
