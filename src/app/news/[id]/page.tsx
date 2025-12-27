"use client";

import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Loader2,
  MessageSquare,
  Plus,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArticleComments } from "@/components/community";
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
  const searchParams = useSearchParams();
  const articleId = params.id as string;

  // URLパラメータから記事情報を取得
  const articleTitle = searchParams.get("title") || "";
  const articleUrl = searchParams.get("url") || "";
  const articleSource = searchParams.get("source") || "";
  const articleDescription = searchParams.get("description") || "";

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<WordPopover | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  // セッション確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUserId(data?.user?.id);
        }
      } catch {
        // 未ログイン
      }
    };
    checkSession();
  }, []);

  // 記事データを構築
  useEffect(() => {
    if (articleTitle || articleUrl) {
      setArticle({
        id: articleId,
        title: decodeURIComponent(articleTitle),
        description: decodeURIComponent(articleDescription),
        url: decodeURIComponent(articleUrl),
        source: decodeURIComponent(articleSource),
        publishedAt: new Date(),
        imageUrl: null,
        author: null,
        content: "",
        language: "en",
      });
    }
    setLoading(false);
  }, [articleId, articleTitle, articleUrl, articleSource, articleDescription]);

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* メイン記事エリア */}
          <div className="lg:col-span-2">
            {article ? (
              <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* 記事ヘッダー */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                      {article.source}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {article.title}
                  </h1>
                  {article.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {article.description}
                    </p>
                  )}
                </div>

                {/* 記事本文へのリンク */}
                <div className="p-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      記事の全文を読む
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      News APIの制限により、全文は元サイトでご確認ください。
                      <br />
                      単語をクリックして意味を確認し、学習に活用できます。
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      元サイトで読む
                    </a>
                  </div>

                  {/* 学習ヒント */}
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                      💡 学習のヒント
                    </h4>
                    <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                      <li>
                        • 記事を読みながら、わからない単語をメモしましょう
                      </li>
                      <li>
                        • 戻ってきたら下のディスカッションで感想を共有できます
                      </li>
                      <li>• 新しいスラングを見つけたら単語帳に追加！</li>
                    </ul>
                  </div>
                </div>

                {/* ディスカッションセクション */}
                <div className="border-t border-gray-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowComments(!showComments)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        ディスカッション
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {showComments ? "閉じる" : "開く"}
                    </span>
                  </button>

                  {showComments && (
                    <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                      <ArticleComments
                        articleId={articleId}
                        currentUserId={userId}
                      />
                    </div>
                  )}
                </div>
              </article>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  記事が見つかりません
                </h2>
                <p className="text-amber-700 dark:text-amber-400 mb-4">
                  ニュース一覧から記事を選択してください
                </p>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ニュース一覧に戻る
                </Link>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* クイックアクション */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                📚 クイックアクション
              </h3>
              <div className="space-y-2">
                <Link
                  href="/english"
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    単語帳を開く
                  </span>
                </Link>
                <Link
                  href="/assessment"
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-lg">🏆</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    レベル診断
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
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
