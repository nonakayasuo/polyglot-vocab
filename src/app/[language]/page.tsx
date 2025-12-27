"use client";

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Download,
  Layers,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CSVImport from "@/components/CSVImport";
import FlashCard from "@/components/FlashCard";
import SearchFilter from "@/components/SearchFilter";
import { ThemeToggle } from "@/components/ThemeToggle";
import VocabularyTable from "@/components/VocabularyTable";
import WordForm from "@/components/WordForm";
import {
  fetchStats,
  fetchWords,
  type LanguageStats,
  type VocabularyWordDB,
} from "@/lib/api";
import { downloadCSV } from "@/lib/csv";
import {
  type FilterOptions,
  LANGUAGES,
  type Language,
} from "@/types/vocabulary";

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

  const [words, setWords] = useState<VocabularyWordDB[]>([]);
  const [stats, setStats] = useState<LanguageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [showWordForm, setShowWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWordDB | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    language: language,
    category: "all",
    source: "all",
    status: "all",
    sortBy: "displayOrder",
    sortOrder: "asc",
  });

  // showLoading: true = 初期ロード時、false = バックグラウンド更新（単語追加時など）
  const loadData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        const [wordsData, statsData] = await Promise.all([
          fetchWords(language),
          fetchStats(language) as Promise<LanguageStats>,
        ]);
        setWords(wordsData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [language]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          w.note.toLowerCase().includes(searchLower)
      );
    }

    // カテゴリフィルター
    if (filters.category !== "all") {
      result = result.filter((w) => w.category === filters.category);
    }

    // ソース（出典）フィルター
    if (filters.source !== "all") {
      result = result.filter((w) => {
        // noteフィールドから[ソース名]を抽出
        const sourceMatch = w.note.match(/^\[([^\]]+)\]/);
        if (sourceMatch) {
          return sourceMatch[1] === filters.source;
        }
        return false;
      });
    }

    // 進捗フィルター（習得済み = check1がtrue）
    if (filters.status === "learned") {
      result = result.filter((w) => w.check1 === true);
    } else if (filters.status === "notLearned") {
      result = result.filter((w) => w.check1 === false);
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

  const handleEdit = (word: VocabularyWordDB) => {
    setEditingWord(word);
    setShowWordForm(true);
  };

  const handleExport = () => {
    // VocabularyWordDB型をVocabularyWord型に変換
    const exportWords = words.map((w) => ({
      ...w,
      language: w.language as Language,
    }));
    downloadCSV(
      exportWords,
      `newslingua-${language}-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー（Notion風） */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* 戻るボタン & タイトル */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                title="ダッシュボードに戻る"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{languageInfo?.flag}</span>
                <h1 className="text-lg font-semibold text-foreground">
                  Vocabulary Book ({languageInfo?.label})
                </h1>
              </div>
            </div>

            {/* ナビゲーション */}
            <nav className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">統計</span>
              </button>
            </nav>

            {/* アクション */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-sm"
                title="CSVインポート"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">インポート</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-sm"
                title="CSVエクスポート"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">エクスポート</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingWord(null);
                  setShowWordForm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">新規</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main
        className={
          view === "list"
            ? "py-4"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        }
      >
        {view === "list" && (
          <div className="space-y-4">
            <div className="px-4 sm:px-6">
              <SearchFilter
                filters={filters}
                onChange={setFilters}
                totalCount={words.length}
                filteredCount={filteredWords.length}
                hideLanguageFilter
              />
            </div>
            <div className="bg-card border-y border-border overflow-x-auto">
              <VocabularyTable
                words={filteredWords}
                filters={filters}
                onFiltersChange={setFilters}
                onEdit={handleEdit}
                onRefresh={() => loadData(false)}
                onAddNew={() => {
                  setEditingWord(null);
                  setShowWordForm(true);
                }}
                defaultLanguage={language}
              />
            </div>
          </div>
        )}

        {view === "flashcard" && (
          <div>
            {filteredWords.length > 0 ? (
              <FlashCard
                words={filteredWords.map((w) => ({
                  ...w,
                  language: w.language as Language,
                }))}
                onComplete={() => setView("list")}
                onRefresh={() => loadData(false)}
              />
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  フラッシュカードに表示する単語がありません
                </h2>
                <p className="text-muted-foreground mb-6">
                  新しい単語を追加するか、フィルターを調整してください
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWord(null);
                    setShowWordForm(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
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
        word={
          editingWord
            ? { ...editingWord, language: editingWord.language as Language }
            : null
        }
        onClose={() => {
          setShowWordForm(false);
          setEditingWord(null);
        }}
        onSave={() => loadData(false)}
        open={showWordForm}
        defaultLanguage={language}
      />

      <CSVImport
        onImport={() => loadData(false)}
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
  const notStartedPercent =
    stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 概要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <p className="text-muted-foreground text-sm">総単語数</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-5">
          <p className="text-emerald-600 dark:text-emerald-400 text-sm">
            ✓ 習得済み
          </p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.mastered}
            <span className="text-lg ml-2">({masteredPercent}%)</span>
          </p>
        </div>
        <div className="bg-secondary border border-border rounded-lg p-5">
          <p className="text-muted-foreground text-sm">□ 未習得</p>
          <p className="text-3xl font-bold text-muted-foreground mt-1">
            {stats.notStarted}
            <span className="text-lg ml-2">({notStartedPercent}%)</span>
          </p>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">学習進捗</h3>
        <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
            style={{ width: `${masteredPercent}%` }}
          />
          <div
            className="bg-muted-foreground/30 transition-all duration-500"
            style={{ width: `${notStartedPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
            <span className="text-muted-foreground">習得済み</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
            <span className="text-muted-foreground">未習得</span>
          </div>
        </div>
      </div>

      {/* カテゴリ別 */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            品詞別分布
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div
                  key={category}
                  className="bg-secondary rounded-lg p-3 text-center border border-border"
                >
                  <p className="text-muted-foreground text-xs">{category}</p>
                  <p className="text-xl font-semibold text-foreground mt-1">
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
