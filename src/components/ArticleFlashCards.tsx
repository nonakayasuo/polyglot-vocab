"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RotateCcw,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { speak } from "@/lib/tts";
import type { Language } from "@/types/vocabulary";

interface WordContext {
  id: string;
  sentence: string;
  sentenceIndex: number | null;
  article: {
    id: string;
    title: string;
    source: string;
    url: string;
  };
}

interface Word {
  id: string;
  word: string;
  pronunciation: string;
  category: string;
  meaning: string;
  example: string;
  language: string;
  check1: boolean;
  contexts: WordContext[];
}

interface Props {
  language?: string;
  onComplete?: () => void;
}

export default function ArticleFlashCards({
  language = "english",
  onComplete,
}: Props) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showContext, setShowContext] = useState(false);

  // 記事から学んだ単語を取得
  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/words?language=${language}&withContext=true`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch words");
        }

        // コンテキストがある単語のみフィルター
        const wordsWithContext = data.filter(
          (w: Word) => w.contexts && w.contexts.length > 0
        );

        // シャッフル
        const shuffled = wordsWithContext.sort(() => Math.random() - 0.5);
        setWords(shuffled);
      } catch (err) {
        console.error("Failed to fetch words:", err);
        setError(
          err instanceof Error ? err.message : "単語の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [language]);

  const currentWord = useMemo(
    () => words[currentIndex] || null,
    [words, currentIndex]
  );

  const goToNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowContext(false);
    } else {
      onComplete?.();
    }
  }, [currentIndex, words.length, onComplete]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowContext(false);
    }
  }, [currentIndex]);

  const restart = useCallback(() => {
    setWords((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowContext(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 font-medium">
          記事から学んだ単語がまだありません
        </p>
        <p className="text-sm text-gray-500 mt-1">
          News Readerで記事を読んで単語を追加しましょう
        </p>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          記事を読む
        </Link>
      </div>
    );
  }

  const context = currentWord?.contexts?.[0];

  return (
    <div className="max-w-xl mx-auto">
      {/* 進捗 */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span>
          {currentIndex + 1} / {words.length}
        </span>
        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          シャッフル
        </button>
      </div>

      {/* 進捗バー */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* カード */}
      <div
        className="relative min-h-[300px] bg-white rounded-2xl shadow-lg border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => e.key === "Enter" && setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
      >
        {!isFlipped ? (
          // 表面（単語）
          <div className="flex flex-col items-center justify-center h-full p-8">
            <span className="text-3xl font-bold text-gray-900 mb-2">
              {currentWord?.word}
            </span>
            {currentWord?.pronunciation && (
              <span className="text-gray-500 font-mono mb-4">
                /{currentWord.pronunciation}/
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentWord) {
                  speak(currentWord.word, currentWord.language as Language);
                }
              }}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <p className="mt-4 text-sm text-gray-400">
              クリックして意味を表示
            </p>
          </div>
        ) : (
          // 裏面（意味）
          <div className="flex flex-col h-full p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {currentWord?.word}
                </span>
                <span className="ml-2 text-gray-500 text-sm">
                  {currentWord?.category}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentWord) {
                    speak(currentWord.word, currentWord.language as Language);
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1">
              <p className="text-lg text-gray-800">{currentWord?.meaning}</p>

              {/* コンテキスト表示 */}
              {context && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowContext(!showContext);
                    }}
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <BookOpen className="w-4 h-4" />
                    {showContext ? "コンテキストを隠す" : "記事のコンテキストを見る"}
                  </button>

                  {showContext && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-gray-700 text-sm italic">
                        "{context.sentence}"
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          📰 {context.article.source}
                        </span>
                        <a
                          href={context.article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                        >
                          記事を読む <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 通常の例文 */}
              {currentWord?.example && !context && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm italic">
                    "{currentWord.example}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
        >
          {currentIndex < words.length - 1 ? "次へ" : "完了"}
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={currentIndex >= words.length - 1}
          className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

