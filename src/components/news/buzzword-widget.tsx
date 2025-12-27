"use client";

import { Flame, RefreshCw, TrendingUp, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/tts";
import type { Language } from "@/types/vocabulary";

interface BuzzWord {
  id: string;
  word: string;
  meaning: string;
  meaningJa: string;
  source: string;
  trendScore: number;
  category?: string;
  examples: string[];
}

// サンプルバズワード（実際はAPIから取得）
const SAMPLE_BUZZWORDS: BuzzWord[] = [
  {
    id: "1",
    word: "slay",
    meaning: "To do something exceptionally well",
    meaningJa: "圧倒的に素晴らしいパフォーマンスをする",
    source: "TWITTER",
    trendScore: 95,
    category: "褒め言葉",
    examples: [
      "She slayed that presentation!",
      "You absolutely slayed at the party last night.",
    ],
  },
  {
    id: "2",
    word: "no cap",
    meaning: "For real, no lie",
    meaningJa: "マジで、嘘じゃなく",
    source: "TIKTOK",
    trendScore: 88,
    category: "強調",
    examples: [
      "That movie was fire, no cap.",
      "No cap, this is the best pizza I've ever had.",
    ],
  },
  {
    id: "3",
    word: "understood the assignment",
    meaning: "Perfectly met expectations",
    meaningJa: "期待に完璧に応えた",
    source: "TWITTER",
    trendScore: 82,
    category: "褒め言葉",
    examples: [
      "The costume designer understood the assignment.",
      "She really understood the assignment with that outfit.",
    ],
  },
  {
    id: "4",
    word: "ate",
    meaning: "Did something perfectly (past tense of 'eat' used as slang)",
    meaningJa: "完璧にやり遂げた",
    source: "TIKTOK",
    trendScore: 79,
    category: "褒め言葉",
    examples: ["She ate and left no crumbs!", "That performance? She ate."],
  },
  {
    id: "5",
    word: "delulu",
    meaning: "Delusional, often used humorously",
    meaningJa: "妄想的な（ユーモラスに使用）",
    source: "TIKTOK",
    trendScore: 75,
    category: "ユーモア",
    examples: [
      "I'm delulu thinking I could finish this project today.",
      "Delulu is the solulu (delusion is the solution).",
    ],
  },
];

const SOURCE_ICONS: Record<string, string> = {
  TWITTER: "𝕏",
  REDDIT: "🔵",
  TIKTOK: "🎵",
};

const SOURCE_COLORS: Record<string, string> = {
  TWITTER: "bg-black text-white",
  REDDIT: "bg-orange-500 text-white",
  TIKTOK: "bg-gradient-to-r from-cyan-500 to-pink-500 text-white",
};

interface BuzzWordWidgetProps {
  language?: Language;
  maxItems?: number;
  compact?: boolean;
}

export function BuzzWordWidget({
  language = "english",
  maxItems = 5,
  compact = false,
}: BuzzWordWidgetProps) {
  const [buzzwords, setBuzzwords] = useState<BuzzWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<BuzzWord | null>(null);

  useEffect(() => {
    const fetchBuzzwords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/buzzwords?limit=${maxItems}`);
        if (res.ok) {
          const data = await res.json();
          setBuzzwords(data.buzzwords || []);
        } else {
          // フォールバック: サンプルデータを使用
          setBuzzwords(SAMPLE_BUZZWORDS.slice(0, maxItems));
        }
      } catch {
        // エラー時はサンプルデータを使用
        setBuzzwords(SAMPLE_BUZZWORDS.slice(0, maxItems));
      } finally {
        setLoading(false);
      }
    };

    fetchBuzzwords();
  }, [maxItems]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/buzzwords?limit=${maxItems}&t=${Date.now()}`,
      );
      if (res.ok) {
        const data = await res.json();
        // ランダムにシャッフルして新鮮さを演出
        const shuffled = (data.buzzwords || []).sort(() => Math.random() - 0.5);
        setBuzzwords(shuffled);
      } else {
        const shuffled = [...SAMPLE_BUZZWORDS].sort(() => Math.random() - 0.5);
        setBuzzwords(shuffled.slice(0, maxItems));
      }
    } catch {
      const shuffled = [...SAMPLE_BUZZWORDS].sort(() => Math.random() - 0.5);
      setBuzzwords(shuffled.slice(0, maxItems));
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              今日のバズワード
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-gray-500 hover:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {buzzwords.map((word) => (
            <Button
              key={word.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWord(word)}
              className="px-3 py-1.5 h-auto bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50"
            >
              {word.word}
            </Button>
          ))}
        </div>

        {/* 詳細ポップアップ */}
        {selectedWord && (
          <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedWord.word}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => speak(selectedWord.word, language)}
                  className="text-gray-400 hover:text-blue-500"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    SOURCE_COLORS[selectedWord.source]
                  }`}
                >
                  {SOURCE_ICONS[selectedWord.source]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedWord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {selectedWord.meaning}
            </p>
            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
              {selectedWord.meaningJa}
            </p>
            {selectedWord.examples[0] && (
              <p className="text-xs text-gray-500 italic">
                "{selectedWord.examples[0]}"
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Flame className="w-6 h-6" />
            <h2 className="text-lg font-bold">今日のバズワード</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <p className="text-white/80 text-sm mt-1">
          SNSでトレンドのスラング・表現
        </p>
      </div>

      {/* Buzzwords List */}
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : (
          buzzwords.map((word, index) => (
            <div
              key={word.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Word and Source */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {word.word}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => speak(word.word, language)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        SOURCE_COLORS[word.source]
                      }`}
                    >
                      {SOURCE_ICONS[word.source]}
                    </span>
                    {word.category && (
                      <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        {word.category}
                      </span>
                    )}
                  </div>

                  {/* Meaning */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {word.meaning}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                    → {word.meaningJa}
                  </p>

                  {/* Example */}
                  {word.examples[0] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                      "{word.examples[0]}"
                    </p>
                  )}
                </div>

                {/* Trend Score */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-orange-500">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">{word.trendScore}</span>
                  </div>
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style={{ width: `${word.trendScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          📱 Twitter/X, Reddit, TikTok からのトレンドを分析
        </p>
      </div>
    </div>
  );
}
