"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleComments } from "@/components/community";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { Overlay } from "@/components/ui/overlay";
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
    definitionJa?: string; // 日本語訳
    example?: string;
  };
  loading: boolean;
}

// 記事コンテンツの状態
interface ArticleContent {
  content: string;
  wordCount: number;
  error?: string;
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
  const [articleContent, setArticleContent] = useState<ArticleContent | null>(
    null,
  );
  const [contentLoading, setContentLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<WordPopover | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  // ポップオーバーの開閉タイミングを追跡（即座に閉じるのを防止）
  const popoverOpenTimeRef = useRef<number>(0);

  // セッション確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/get-session");
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

  // 記事の全文を取得
  const fetchArticleContent = useCallback(async () => {
    if (!articleUrl) return;

    setContentLoading(true);
    setArticleContent(null);

    try {
      const decodedUrl = decodeURIComponent(articleUrl);
      const res = await fetch(
        `/api/news/content?url=${encodeURIComponent(decodedUrl)}`,
      );

      if (res.ok) {
        const data = await res.json();
        setArticleContent({
          content: data.content,
          wordCount: data.wordCount,
        });
      } else {
        const errorData = await res.json();
        setArticleContent({
          content: "",
          wordCount: 0,
          error: errorData.error || "記事の取得に失敗しました",
        });
      }
    } catch (error) {
      console.error("Failed to fetch article content:", error);
      setArticleContent({
        content: "",
        wordCount: 0,
        error: "記事の取得に失敗しました",
      });
    } finally {
      setContentLoading(false);
    }
  }, [articleUrl]);

  // 初回ロード時に記事を取得
  useEffect(() => {
    if (articleUrl && !articleContent && !contentLoading) {
      fetchArticleContent();
    }
  }, [articleUrl, articleContent, contentLoading, fetchArticleContent]);

  // 単語クリック時の処理
  const handleWordClick = useCallback(
    async (event: React.MouseEvent<HTMLSpanElement>, word: string) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();

      if (!cleanWord || cleanWord.length < 2) {
        return;
      }

      // ビューポート内で適切な位置を計算
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // ポップオーバーが画面下に出ないように調整
      let yPos = rect.bottom + scrollY + 8;
      if (rect.bottom > viewportHeight - 350) {
        // 下に余裕がない場合は上に表示
        yPos = rect.top + scrollY - 8;
      }

      // ポップオーバー開始時刻を記録（即座に閉じるのを防止）
      popoverOpenTimeRef.current = Date.now();

      setPopover({
        word: cleanWord,
        x: rect.left + rect.width / 2,
        y: yPos,
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
          const meaning = entry?.meanings?.[0];

          // phoneticsから発音記号を取得（entry.phoneticがない場合）
          const phonetic =
            entry?.phonetic ||
            entry?.phonetics?.find((p: { text?: string }) => p.text)?.text;

          const englishDefinition = meaning?.definitions?.[0]?.definition;
          const example = meaning?.definitions?.[0]?.example;

          // 日本語訳を取得
          let definitionJa = "";
          if (englishDefinition) {
            try {
              const translateRes = await fetch(
                `/api/translate?text=${encodeURIComponent(
                  englishDefinition,
                )}&from=en&to=ja`,
              );
              if (translateRes.ok) {
                const translateData = await translateRes.json();
                definitionJa = translateData.translatedText;
              }
            } catch {
              // 翻訳エラーは無視
            }
          }

          const definitionData = {
            word: entry?.word || cleanWord,
            phonetic: phonetic,
            partOfSpeech: meaning?.partOfSpeech,
            definition: englishDefinition,
            definitionJa: definitionJa,
            example: example,
          };

          setPopover((prev) =>
            prev
              ? { ...prev, loading: false, definition: definitionData }
              : null,
          );
        } else {
          setPopover((prev) =>
            prev ? { ...prev, loading: false, definition: undefined } : null,
          );
        }
      } catch {
        setPopover((prev) =>
          prev ? { ...prev, loading: false, definition: undefined } : null,
        );
      }
    },
    [],
  );

  // ポップオーバーを閉じる（開いてすぐは閉じないように保護）
  const closePopover = useCallback(() => {
    const timeSinceOpen = Date.now() - popoverOpenTimeRef.current;
    // 200ms以内は閉じないようにする（タッチイベントの誤動作防止）
    if (timeSinceOpen < 200) {
      return;
    }
    setPopover(null);
  }, []);

  // 単語を単語帳に追加
  const addToVocabulary = useCallback(async () => {
    if (!popover?.definition) return;

    try {
      // 日本語訳がある場合は「日本語訳\n(英語定義)」形式で保存
      const meaningText = popover.definition.definitionJa
        ? `${popover.definition.definitionJa}\n(${
            popover.definition.definition || ""
          })`
        : popover.definition.definition || "";

      const response = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: popover.definition.word,
          pronunciation: popover.definition.phonetic || "",
          category: popover.definition.partOfSpeech || "Other",
          meaning: meaningText,
          example: popover.definition.example || "",
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

  // テキストをクリック可能な単語に分割
  const renderClickableText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      // 空白はそのまま返す（順序は変わらないためindexで問題ない）
      if (/^\s+$/.test(word)) {
        // biome-ignore lint/suspicious/noArrayIndexKey: 空白文字は同一内容のためindexが必要
        return <span key={`space-${index}`}>{word}</span>;
      }
      // 単語はクリック/タップ可能にする
      const handleTap = (
        e:
          | React.MouseEvent<HTMLButtonElement>
          | React.PointerEvent<HTMLButtonElement>,
      ) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const syntheticEvent = {
          currentTarget: {
            getBoundingClientRect: () => rect,
          },
        } as React.MouseEvent<HTMLSpanElement>;
        handleWordClick(syntheticEvent, word);
      };

      return (
        <button
          type="button"
          key={`word-${index}-${word}`}
          onPointerUp={handleTap}
          className="inline cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900/50 active:bg-yellow-300 dark:active:bg-yellow-800/70 text-inherit rounded px-0.5 transition-colors touch-manipulation border-none bg-transparent p-0 m-0 font-inherit text-left select-none"
          style={{ WebkitTapHighlightColor: "rgba(234, 179, 8, 0.3)" }}
        >
          {word}
        </button>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/news"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ニュース一覧</span>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
                    {articleContent?.wordCount && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        約 {articleContent.wordCount} 語
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {article.title}
                  </h1>
                  {article.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {renderClickableText(article.description)}
                    </p>
                  )}
                </div>

                {/* 記事本文 */}
                <div className="p-6">
                  {contentLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        記事を読み込んでいます...
                      </p>
                    </div>
                  ) : articleContent?.content ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-6">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                          💡 <strong>単語をクリック</strong>
                          すると意味を確認できます。気になる単語は単語帳に追加しましょう！
                        </p>
                      </div>
                      <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {articleContent.content.split("\n\n").map((para, i) => (
                          <p
                            key={`para-${i}-${para.slice(0, 20)}`}
                            className="mb-4"
                          >
                            {renderClickableText(para)}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : articleContent?.error ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
                      <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        記事の取得に失敗しました
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        一部のサイトはコンテンツの取得を制限しています。
                        <br />
                        元サイトで直接お読みください。
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          type="button"
                          onClick={fetchArticleContent}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          再試行
                        </button>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          元サイトで読む
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {/* 元サイトへのリンク */}
                  {articleContent?.content && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        元サイトで読む
                      </a>
                    </div>
                  )}
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

            {/* 学習ヒント */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                💡 学習のヒント
              </h4>
              <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                <li>• 単語をクリックして意味を確認</li>
                <li>• 気になる単語は単語帳に追加</li>
                <li>• ディスカッションで感想を共有</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 単語ポップオーバー */}
      {popover && (
        <>
          {/* 背景クリックで閉じる */}
          <Overlay onClose={closePopover} />

          {/* ポップオーバー本体 */}
          <FloatingPanel x={popover.x} y={popover.y}>
            {popover.loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : popover.definition ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {popover.definition.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      popover.definition?.word &&
                      speak(popover.definition.word, "english")
                    }
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {popover.definition.phonetic && (
                  <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-2">
                    /{popover.definition.phonetic}/
                  </p>
                )}

                {popover.definition.partOfSpeech && (
                  <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded mb-2">
                    {popover.definition.partOfSpeech}
                  </span>
                )}

                {/* 日本語訳（メイン表示） */}
                {popover.definition.definitionJa && (
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    {popover.definition.definitionJa}
                  </p>
                )}

                {/* 英語定義 */}
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                  {popover.definition.definition}
                </p>

                {/* 例文 */}
                {popover.definition.example && (
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 mb-3">
                    <p className="text-gray-600 dark:text-gray-300 text-xs italic">
                      例: {popover.definition.example}
                    </p>
                  </div>
                )}

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
                <p className="text-gray-500 dark:text-gray-400">
                  定義が見つかりませんでした
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  「{popover.word}」
                </p>
              </div>
            )}
          </FloatingPanel>
        </>
      )}
    </div>
  );
}
