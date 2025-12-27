"use client";

import { ArrowLeft, BookOpen, Loader2, Plus, Volume2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { speak } from "@/lib/tts";
import type { Article } from "@/types/news";

// 単語ポップオーバーの状態
interface WordPopover {
  word: string;
  x: number;
  y: number;
  definition?: {
    word: string;
    phonetic?: string;
    partOfSpeech?: string;
    definition?: string;
  };
  loading: boolean;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, _setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popover, setPopover] = useState<WordPopover | null>(null);

  // 記事を取得（実際はAPIから取得するが、今はダミー）
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        // TODO: 記事詳細APIを実装
        // 今はエラーを表示
        setError(
          "記事詳細ページは開発中です。News APIの制限により、記事の全文は元サイトでご確認ください。",
        );
      } catch (_err) {
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);

  // 単語クリック時の処理
  const _handleWordClick = useCallback(
    async (event: React.MouseEvent<HTMLSpanElement>, word: string) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();

      if (!cleanWord) return;

      setPopover({
        word: cleanWord,
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 8,
        loading: true,
      });

      try {
        // Free Dictionary API で定義を取得
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`,
        );

        if (response.ok) {
          const data = await response.json();
          const entry = data[0];
          const meaning = entry.meanings?.[0];

          setPopover((prev) =>
            prev
              ? {
                  ...prev,
                  loading: false,
                  definition: {
                    word: entry.word,
                    phonetic: entry.phonetic,
                    partOfSpeech: meaning?.partOfSpeech,
                    definition: meaning?.definitions?.[0]?.definition,
                  },
                }
              : null,
          );
        } else {
          setPopover((prev) =>
            prev ? { ...prev, loading: false, definition: undefined } : null,
          );
        }
      } catch (_err) {
        setPopover((prev) =>
          prev ? { ...prev, loading: false, definition: undefined } : null,
        );
      }
    },
    [],
  );

  // ポップオーバーを閉じる
  const closePopover = useCallback(() => {
    setPopover(null);
  }, []);

  // 単語を単語帳に追加
  const addToVocabulary = useCallback(async () => {
    if (!popover?.definition) return;

    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: popover.definition.word,
          pronunciation: popover.definition.phonetic || "",
          category: popover.definition.partOfSpeech || "Other",
          meaning: popover.definition.definition || "",
          example: "", // TODO: 記事のコンテキストを追加
          exampleTranslation: "",
          note: article ? `[${article.source}]` : "",
          language: "english",
          check1: false,
          check2: false,
          check3: false,
        }),
      });

      if (response.ok) {
        alert(`"${popover.definition.word}" を単語帳に追加しました！`);
        closePopover();
      }
    } catch (err) {
      console.error("Failed to add word:", err);
      alert("単語の追加に失敗しました");
    }
  }, [popover, article, closePopover]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/news"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ニュース一覧</span>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Article Reader
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-800 mb-2">
              開発中の機能
            </h2>
            <p className="text-amber-700 mb-4">{error}</p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ニュース一覧に戻る
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* 記事コンテンツをここに表示 */}
            <div className="p-8">
              <p className="text-gray-500">記事ID: {articleId}</p>
            </div>
          </article>
        )}
      </main>

      {/* 単語ポップオーバー */}
      {popover && (
        <>
          {/* 背景クリックで閉じる */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={closePopover}
            aria-label="閉じる"
          />

          {/* ポップオーバー本体 */}
          <div
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[280px] max-w-[360px]"
            style={{
              left: `${Math.min(popover.x, window.innerWidth - 380)}px`,
              top: `${popover.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            {popover.loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : popover.definition ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {popover.definition.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      popover.definition?.word &&
                      speak(popover.definition.word, "english")
                    }
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {popover.definition.phonetic && (
                  <p className="text-gray-500 font-mono text-sm mb-2">
                    /{popover.definition.phonetic}/
                  </p>
                )}

                {popover.definition.partOfSpeech && (
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded mb-2">
                    {popover.definition.partOfSpeech}
                  </span>
                )}

                <p className="text-gray-700 text-sm mb-4">
                  {popover.definition.definition}
                </p>

                <button
                  type="button"
                  onClick={addToVocabulary}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  単語帳に追加
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">定義が見つかりませんでした</p>
                <p className="text-gray-400 text-sm mt-1">「{popover.word}」</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
