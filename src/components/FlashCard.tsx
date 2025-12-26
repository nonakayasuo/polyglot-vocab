"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Shuffle,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { updateWordAPI } from "@/lib/api";
import { speak } from "@/lib/tts";
import type { VocabularyWord } from "@/types/vocabulary";

interface Props {
  words: VocabularyWord[];
  onComplete: () => void;
  onRefresh: () => void;
}

export default function FlashCard({ words, onComplete, onRefresh }: Props) {
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionKnownCount, setSessionKnownCount] = useState(0); // 今回のセッションで覚えた数
  const [sessionUnknownCount, setSessionUnknownCount] = useState(0); // 今回のセッションで覚えていなかった数
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false); // 未学習のみ表示

  // 習得済みの単語数（データベースに保存されている）
  const totalMasteredCount = words.filter((w) => w.check1).length;
  const totalUnlearnedCount = words.length - totalMasteredCount;

  const shuffleWords = useCallback(() => {
    let wordsToShuffle = [...words];
    // 未学習のみ表示モードの場合、check1がfalseの単語のみをシャッフル
    if (showOnlyUnlearned) {
      wordsToShuffle = wordsToShuffle.filter((w) => !w.check1);
    }
    const shuffled = wordsToShuffle.sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionKnownCount(0);
    setSessionUnknownCount(0);
  }, [words, showOnlyUnlearned]);

  // words または showOnlyUnlearned が変わったらシャッフルし直す
  useEffect(() => {
    shuffleWords();
  }, [shuffleWords]);

  // 未学習のみモードが変更されたらシャッフルし直す
  useEffect(() => {
    shuffleWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnlyUnlearned]);

  const currentWord = shuffledWords[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // フラッシュカード終了時にデータをリフレッシュしてから完了
      onRefresh();
      onComplete();
    }
  }, [currentIndex, shuffledWords.length, onComplete, onRefresh]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex]);

  const markAsKnown = useCallback(async () => {
    if (currentWord) {
      // 習得済みフラグを立てる（まだ習得済みでない場合のみ）
      if (!currentWord.check1) {
        try {
          await updateWordAPI(currentWord.id, { check1: true });
          // shuffledWordsのローカル状態も更新（onRefreshは呼ばない - リセットされるため）
          setShuffledWords((prev) =>
            prev.map((w) => (w.id === currentWord.id ? { ...w, check1: true } : w))
          );
        } catch (error) {
          console.error("Failed to mark as learned:", error);
        }
      }
      setSessionKnownCount((prev) => prev + 1);
    }
    goToNext();
  }, [currentWord, goToNext]);

  const markAsUnknown = useCallback(() => {
    setSessionUnknownCount((prev) => prev + 1);
    goToNext();
  }, [goToNext]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowRight":
          markAsKnown();
          break;
        case "ArrowLeft":
          markAsUnknown();
          break;
        case "ArrowUp":
          goToPrevious();
          break;
        case "ArrowDown":
          goToNext();
          break;
        case "s":
          if (currentWord) speak(currentWord.word, currentWord.language);
          break;
      }
    },
    [currentWord, goToNext, goToPrevious, markAsKnown, markAsUnknown],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <p>表示する単語がありません</p>
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          戻る
        </button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 統計情報 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              📚 全体: <strong>{words.length}</strong>語
            </span>
            <span className="text-emerald-600">
              ✓ 習得済み: <strong>{totalMasteredCount}</strong>
            </span>
            <span className="text-gray-500">
              □ 未学習: <strong>{totalUnlearnedCount}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowOnlyUnlearned(!showOnlyUnlearned)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              showOnlyUnlearned
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
            }`}
          >
            {showOnlyUnlearned ? "🎯 未学習のみ" : "📖 全単語"}
          </button>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <span>
            {shuffledWords.length > 0 ? currentIndex + 1 : 0} / {shuffledWords.length}
          </span>
          <div className="flex gap-4">
            <span className="text-emerald-500">今回 ✓ {sessionKnownCount}</span>
            <span className="text-red-500">✗ {sessionUnknownCount}</span>
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* カード */}
      <div
        role="button"
        tabIndex={0}
        className="relative perspective-1000 cursor-pointer w-full text-left"
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <div
          className={`relative w-full min-h-[400px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* 表面（単語） */}
          <div
            className={`absolute inset-0 backface-hidden bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg ${
              isFlipped ? "invisible" : ""
            }`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(currentWord.word, currentWord.language);
                }}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="p-2 text-gray-400 hover:text-amber-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
              </button>
            </div>

            <span className="text-gray-400 text-sm mb-2">
              {currentWord.category}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              {currentWord.word}
            </h2>
            {currentWord.pronunciation && (
              <p className="text-gray-500 font-mono text-lg">
                /{currentWord.pronunciation}/
              </p>
            )}

            {showHint && currentWord.example && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-amber-700 text-sm italic">
                  {currentWord.example}
                </p>
              </div>
            )}

            <p className="absolute bottom-4 text-gray-400 text-sm">
              クリックまたはスペースキーで裏返す
            </p>
          </div>

          {/* 裏面（意味） */}
          <div
            className={`absolute inset-0 backface-hidden bg-blue-50 border border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg ${
              !isFlipped ? "invisible" : ""
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              {currentWord.meaning || "(意味未登録)"}
            </h3>

            {currentWord.example && (
              <div className="mt-4 p-4 bg-white/50 rounded-xl max-w-md border border-blue-100">
                <p className="text-gray-700 text-center">
                  {currentWord.example}
                </p>
              </div>
            )}

            {currentWord.note && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
                <p className="text-amber-700 text-sm text-center">
                  💡 {currentWord.note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コントロール */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={markAsUnknown}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
        >
          <X className="w-5 h-5" />
          まだ覚えていない
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={markAsKnown}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
        >
          <Check className="w-5 h-5" />
          覚えた！
        </button>
      </div>

      {/* ナビゲーション */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          前へ
        </button>

        <button
          type="button"
          onClick={shuffleWords}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          シャッフル
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          次へ
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* キーボードショートカット */}
      <div className="mt-8 text-center text-gray-400 text-xs">
        <p>
          キーボードショートカット: Space/Enter=裏返す | ←=まだ | →=覚えた |
          S=発音
        </p>
      </div>
    </div>
  );
}
