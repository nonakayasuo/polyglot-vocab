"use client";

import { BookOpen, Loader2, Plus, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";

interface WordTooltipProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToVocabulary: (word: string, data: WordData) => void;
}

interface WordData {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
}

export default function WordTooltip({
  word,
  position,
  onClose,
  onAddToVocabulary,
}: WordTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // 初回レンダリング時にAIから単語情報を取得
  useState(() => {
    const fetchWordData = async () => {
      setIsLoading(true);
      try {
        // 仮のデータ（将来的にはAI APIから取得）
        await new Promise((resolve) => setTimeout(resolve, 500));
        setWordData({
          word,
          pronunciation: "/ɪɡˈzæmpəl/",
          partOfSpeech: "noun",
          definition: "この単語の意味の説明がここに表示されます。",
          examples: [
            "This is an example sentence.",
            "Here is another example.",
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchWordData();
  });

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleAddToVocabulary = () => {
    if (wordData) {
      onAddToVocabulary(word, wordData);
      setIsAdded(true);
    }
  };

  // ポジション調整（画面端の処理）
  const tooltipStyle = {
    top: position.y + 10,
    left: Math.min(position.x, window.innerWidth - 320),
  };

  return (
    <>
      {/* オーバーレイ */}
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        onClick={onClose}
        aria-label="閉じる"
      />

      {/* ツールチップ */}
      <div
        className="fixed z-50 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        style={tooltipStyle}
      >
        {isLoading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : wordData ? (
          <>
            {/* ヘッダー */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {wordData.word}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {wordData.pronunciation} • {wordData.partOfSpeech}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="発音を聞く"
                >
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-4">
              <p className="text-slate-200 mb-4">{wordData.definition}</p>

              {wordData.examples.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    例文
                  </h4>
                  <ul className="space-y-2">
                    {wordData.examples.map((example) => (
                      <li
                        key={example}
                        className="text-sm text-slate-300 pl-3 border-l-2 border-emerald-500/50"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* アクション */}
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <button
                type="button"
                onClick={handleAddToVocabulary}
                disabled={isAdded}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                  isAdded
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                <Plus className="w-4 h-4" />
                {isAdded ? "追加済み" : "単語帳に追加"}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="詳しく聞く"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-slate-400">
            単語情報を取得できませんでした
          </div>
        )}
      </div>
    </>
  );
}
