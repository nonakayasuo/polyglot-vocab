"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import {
  VocabularyWord,
  FilterOptions,
  Language,
  LANGUAGES,
} from "@/types/vocabulary";
import {
  getVocabularyByLanguage,
  getStatsByLanguage,
  LanguageStats,
} from "@/lib/storage";
import { downloadCSV } from "@/lib/csv";
import VocabularyTable from "@/components/VocabularyTable";
import WordForm from "@/components/WordForm";
import SearchFilter from "@/components/SearchFilter";
import FlashCard from "@/components/FlashCard";
import CSVImport from "@/components/CSVImport";
import {
  Plus,
  Upload,
  Download,
  BookOpen,
  BarChart3,
  Layers,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type View = "list" | "flashcard" | "stats";

const validLanguages: Language[] = ["english", "spanish", "korean", "chinese"];

export default function LanguagePage() {
  const params = useParams();
  const language = params.language as Language;

  // 有効な言語かチェック
  if (!validLanguages.includes(language)) {
    notFound();
  }

  const languageInfo = LANGUAGES.find((l) => l.value === language);

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [stats, setStats] = useState<LanguageStats | null>(null);
  const [view, setView] = useState<View>("list");
  const [showWordForm, setShowWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    language: language,
    category: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const loadData = () => {
    setWords(getVocabularyByLanguage(language));
    setStats(getStatsByLanguage(language));
  };

  useEffect(() => {
    loadData();
  }, [language]);

  // フィルタリングされた単語リスト
  const filteredWords = useMemo(() => {
    let result = [...words];

    // 検索フィルター
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(searchLower) ||
          w.meaning.toLowerCase().includes(searchLower) ||
          w.example.toLowerCase().includes(searchLower) ||
          w.note.toLowerCase().includes(searchLower),
      );
    }

    // カテゴリフィルター
    if (filters.category !== "all") {
      result = result.filter((w) => w.category === filters.category);
    }

    // 進捗フィルター（Notion風）
    if (filters.status !== "all") {
      result = result.filter((w) => {
        const checks = [w.check1, w.check2, w.check3];
        const checkCount = checks.filter(Boolean).length;

        switch (filters.status) {
          case "notStarted":
            return checkCount === 0;
          case "level1":
            return checkCount === 1;
          case "level2":
            return checkCount === 2;
          case "mastered":
            return checkCount === 3;
          case "learning":
            return checkCount > 0 && checkCount < 3;
          default:
            return true;
        }
      });
    }

    // ソート
    result.sort((a, b) => {
      let aVal: string | number = a[filters.sortBy];
      let bVal: string | number = b[filters.sortBy];

      if (filters.sortBy === "word") {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return filters.sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [words, filters]);

  const handleEdit = (word: VocabularyWord) => {
    setEditingWord(word);
    setShowWordForm(true);
  };

  const handleExport = () => {
    downloadCSV(
      words,
      `polyglot-vocab-${language}-${new Date().toISOString().split("T")[0]}.csv`,
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー（Notion風） */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* 戻るボタン & タイトル */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="ダッシュボードに戻る"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{languageInfo?.flag}</span>
                <h1 className="text-lg font-semibold text-gray-900">
                  Vocabulary Book ({languageInfo?.label})
                </h1>
              </div>
            </div>

            {/* ナビゲーション */}
            <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">単語一覧</span>
              </button>
              <button
                type="button"
                onClick={() => setView("flashcard")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "flashcard"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">フラッシュカード</span>
              </button>
              <button
                type="button"
                onClick={() => setView("stats")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "stats"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">統計</span>
              </button>
            </nav>

            {/* アクション */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm"
                title="CSVインポート"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">インポート</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm"
                title="CSVエクスポート"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">エクスポート</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingWord(null);
                  setShowWordForm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">新規</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === "list" && (
          <div className="space-y-4">
            <SearchFilter
              filters={filters}
              onChange={setFilters}
              totalCount={words.length}
              filteredCount={filteredWords.length}
              hideLanguageFilter
            />
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <VocabularyTable
                words={filteredWords}
                filters={filters}
                onFiltersChange={setFilters}
                onEdit={handleEdit}
                onRefresh={loadData}
                onAddNew={() => {
                  setEditingWord(null);
                  setShowWordForm(true);
                }}
              />
            </div>
          </div>
        )}

        {view === "flashcard" && (
          <div>
            {filteredWords.length > 0 ? (
              <FlashCard
                words={filteredWords}
                onComplete={() => setView("list")}
                onRefresh={loadData}
              />
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  フラッシュカードに表示する単語がありません
                </h2>
                <p className="text-gray-500 mb-6">
                  新しい単語を追加するか、フィルターを調整してください
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWord(null);
                    setShowWordForm(true);
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  単語を追加
                </button>
              </div>
            )}
          </div>
        )}

        {view === "stats" && stats && (
          <div>
            <LanguageStatistics stats={stats} />
          </div>
        )}
      </main>

      {/* モーダル */}
      <WordForm
        word={editingWord}
        onClose={() => {
          setShowWordForm(false);
          setEditingWord(null);
        }}
        onSave={loadData}
        open={showWordForm}
        defaultLanguage={language}
      />

      <CSVImport
        onImport={loadData}
        onClose={() => setShowImport(false)}
        open={showImport}
      />
    </div>
  );
}

// 言語別統計コンポーネント
function LanguageStatistics({ stats }: { stats: LanguageStats }) {
  const masteredPercent =
    stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const learningPercent =
    stats.total > 0 ? Math.round((stats.learning / stats.total) * 100) : 0;
  const notStartedPercent =
    stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-gray-500 text-sm">総単語数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <p className="text-emerald-600 text-sm">習得済み (■■■)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {stats.mastered}
            <span className="text-lg ml-2">({masteredPercent}%)</span>
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <p className="text-amber-600 text-sm">学習中</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {stats.learning}
            <span className="text-lg ml-2">({learningPercent}%)</span>
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <p className="text-gray-500 text-sm">未学習 (□□□)</p>
          <p className="text-3xl font-bold text-gray-500 mt-1">
            {stats.notStarted}
            <span className="text-lg ml-2">({notStartedPercent}%)</span>
          </p>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">学習進捗</h3>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${masteredPercent}%` }}
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${learningPercent}%` }}
          />
          <div
            className="bg-gray-300 transition-all duration-500"
            style={{ width: `${notStartedPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-gray-600">習得済み</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full" />
            <span className="text-gray-600">学習中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
            <span className="text-gray-600">未学習</span>
          </div>
        </div>
      </div>

      {/* カテゴリ別 */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            品詞別分布
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div
                  key={category}
                  className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100"
                >
                  <p className="text-gray-500 text-xs">{category}</p>
                  <p className="text-xl font-semibold text-gray-800 mt-1">
                    {count}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
