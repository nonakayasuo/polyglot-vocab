"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Languages, ChevronRight } from "lucide-react";
import { LANGUAGES, Language } from "@/types/vocabulary";
import { getStatsByLanguage, getStats, LanguageStats } from "@/lib/storage";

export default function Home() {
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

  const loadData = () => {
    const stats: Record<Language, LanguageStats> = {
      english: getStatsByLanguage("english"),
      spanish: getStatsByLanguage("spanish"),
      korean: getStatsByLanguage("korean"),
      chinese: getStatsByLanguage("chinese"),
    };
    setLanguageStats(stats);

    const overall = getStats();
    setTotalStats({
      total: overall.total,
      mastered: overall.mastered,
      learning: overall.learning,
      notStarted: overall.notStarted,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProgressPercent = (stats: LanguageStats) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.mastered / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-gray-700" />
              <h1 className="text-lg font-semibold text-gray-900">
                Vocabulary Book
              </h1>
            </div>
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-500 text-xs">総単語数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalStats.total}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-emerald-600 text-xs">■■■ 習得済み</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {totalStats.mastered}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-amber-600 text-xs">学習中</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {totalStats.learning}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-400 text-xs">□□□ 未学習</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">
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
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium">
                  単語数
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium">
                  ■■■
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium">
                  学習中
                </th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium">
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
                          <p className="text-xs text-gray-400">
                            Vocabulary Book
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        {stats.total}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="text-emerald-600 font-medium">
                        {stats.mastered}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="text-amber-600 font-medium">
                        {stats.learning}
                      </span>
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="text-gray-400 font-medium">
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
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>💡 各言語をクリックして、フラッシュカードで効率的に復習しましょう</p>
        </div>
      </main>
    </div>
  );
}
