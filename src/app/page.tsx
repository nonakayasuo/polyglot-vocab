"use client";

import { ChevronRight, Languages, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
      learning: 0,
      notStarted: 0,
      byCategory: {},
    },
    spanish: {
      total: 0,
      mastered: 0,
      learning: 0,
      notStarted: 0,
      byCategory: {},
    },
    korean: {
      total: 0,
      mastered: 0,
      learning: 0,
      notStarted: 0,
      byCategory: {},
    },
    chinese: {
      total: 0,
      mastered: 0,
      learning: 0,
      notStarted: 0,
      byCategory: {},
    },
  });
  const [totalStats, setTotalStats] = useState({
    total: 0,
    mastered: 0,
    learning: 0,
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
        learning: overall.learning,
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-gray-900" />
              <h1 className="text-lg font-semibold text-gray-900">
                Vocabulary Book
              </h1>
            </div>
            <div className="text-xs text-gray-500">SQLite Database</div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タイトル */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📚 Vocabulary Book
          </h2>
          <p className="text-gray-500">
            言語を選択して、単語の追加・学習を始めましょう
          </p>
        </div>

        {/* 総合統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500 text-xs">総単語数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalStats.total}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-emerald-600 text-xs">■■■ 習得済み</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {totalStats.mastered}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-600 text-xs">学習中</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {totalStats.learning}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500 text-xs">□□□ 未学習</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">
              {totalStats.notStarted}
            </p>
          </div>
        </div>

        {/* 言語リスト（Notion風テーブル） */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium">
                  言語
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium hidden sm:table-cell">
                  単語数
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium hidden md:table-cell">
                  ■■■
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium hidden md:table-cell">
                  学習中
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium hidden md:table-cell">
                  □□□
                </th>
                <th className="px-4 py-3 text-gray-500 text-xs font-medium">
                  進捗
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {LANGUAGES.map((lang) => {
                const stats = languageStats[lang.value];
                const progressPercent = getProgressPercent(stats);

                return (
                  <tr
                    key={lang.value}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/${lang.value}`}
                        className="flex items-center gap-3 group"
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {lang.label}
                          </span>
                          <p className="text-xs text-gray-500">
                            Vocabulary Book
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="text-center px-4 py-4 hidden sm:table-cell">
                      <span className="font-semibold text-gray-900">
                        {stats.total}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4 hidden md:table-cell">
                      <span className="text-emerald-600 font-medium">
                        {stats.mastered}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4 hidden md:table-cell">
                      <span className="text-amber-600 font-medium">
                        {stats.learning}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4 hidden md:table-cell">
                      <span className="text-gray-500 font-medium">
                        {stats.notStarted}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/${lang.value}`}
                        className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ヒント */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>
            💡 各言語をクリックして、フラッシュカードで効率的に復習しましょう
          </p>
        </div>
      </main>
    </div>
  );
}
