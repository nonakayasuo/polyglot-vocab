"use client";

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  language?: string;
  onWordHighlight?: (word: string, index: number) => void;
}

export default function ArticleReader({
  text,
  language = "en-US",
  onWordHighlight,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [rate, setRate] = useState(1);
  const [currentWord, setCurrentWord] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  const speak = useCallback(
    (paragraphIndex: number) => {
      if (paragraphIndex >= paragraphs.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentParagraph(0);
        return;
      }

      // 前の発話をキャンセル
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        paragraphs[paragraphIndex],
      );
      utterance.lang = language;
      utterance.rate = rate;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentParagraph(paragraphIndex);
      };

      utterance.onend = () => {
        // 次の段落へ
        speak(paragraphIndex + 1);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsPlaying(false);
      };

      // 単語ハイライト（ブラウザがサポートしている場合）
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const word = paragraphs[paragraphIndex].slice(
            event.charIndex,
            event.charIndex + event.charLength,
          );
          setCurrentWord(word);
          onWordHighlight?.(word, event.charIndex);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [paragraphs, language, rate, onWordHighlight],
  );

  const handlePlay = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speak(currentParagraph);
    }
  }, [isPaused, speak, currentParagraph]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraph(0);
    setCurrentWord(null);
  }, []);

  const handlePrevious = useCallback(() => {
    const prev = Math.max(0, currentParagraph - 1);
    setCurrentParagraph(prev);
    if (isPlaying) {
      speak(prev);
    }
  }, [currentParagraph, isPlaying, speak]);

  const handleNext = useCallback(() => {
    const next = Math.min(paragraphs.length - 1, currentParagraph + 1);
    setCurrentParagraph(next);
    if (isPlaying) {
      speak(next);
    }
  }, [currentParagraph, paragraphs.length, isPlaying, speak]);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      {/* 進捗表示 */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
        <span>
          段落 {currentParagraph + 1} / {paragraphs.length}
        </span>
        {currentWord && (
          <span className="text-blue-600 font-medium">{currentWord}</span>
        )}
      </div>

      {/* 進捗バー */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{
            width: `${((currentParagraph + 1) / paragraphs.length) * 100}%`,
          }}
        />
      </div>

      {/* コントロール */}
      <div className="flex items-center justify-center gap-2">
        {/* 前へ */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentParagraph === 0}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* 再生/一時停止 */}
        {isPlaying && !isPaused ? (
          <button
            type="button"
            onClick={handlePause}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Play className="w-6 h-6 ml-0.5" />
          </button>
        )}

        {/* 停止 */}
        <button
          type="button"
          onClick={handleStop}
          disabled={!isPlaying && !isPaused}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <Square className="w-5 h-5" />
        </button>

        {/* 次へ */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentParagraph >= paragraphs.length - 1}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* 速度調整 */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">速度</span>
        <div className="flex items-center gap-1">
          {[0.5, 0.75, 1, 1.25, 1.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRate(r)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                rate === r
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
