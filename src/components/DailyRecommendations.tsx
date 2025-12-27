"use client";

import {
  BookOpen,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { speak } from "@/lib/tts";

interface Recommendation {
  id: string;
  word: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  cefrLevel: string;
  frequencyRank: number | null;
  sentence: string;
  isAdded: boolean;
  isSkipped: boolean;
}

interface Props {
  onWordAdded?: () => void;
}

export default function DailyRecommendations({ onWordAdded }: Props) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommendations?limit=5");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations");
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError(
        err instanceof Error ? err.message : "おすすめ単語の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleAction = useCallback(
    async (recommendationId: string, addToVocabulary: boolean) => {
      setProcessingId(recommendationId);

      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recommendationId, addToVocabulary }),
        });

        if (response.ok) {
          // リストから削除
          setRecommendations((prev) =>
            prev.filter((r) => r.id !== recommendationId)
          );
          if (addToVocabulary) {
            onWordAdded?.();
          }
        }
      } catch (err) {
        console.error("Failed to process recommendation:", err);
      } finally {
        setProcessingId(null);
      }
    },
    [onWordAdded]
  );

  const handleAddAll = useCallback(async () => {
    for (const rec of recommendations) {
      await handleAction(rec.id, true);
    }
  }, [recommendations, handleAction]);

  const getCefrColor = (level: string) => {
    switch (level) {
      case "B2":
        return "bg-blue-100 text-blue-700";
      case "C1":
        return "bg-purple-100 text-purple-700";
      case "C2":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span className="ml-2 text-amber-600">おすすめ単語を取得中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="text-center py-4">
          <p className="text-amber-600">{error}</p>
          <button
            type="button"
            onClick={fetchRecommendations}
            className="mt-2 text-sm text-amber-700 underline hover:no-underline"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-emerald-800">
              今日のおすすめはすべて確認済みです！
            </p>
            <p className="text-sm text-emerald-600">
              明日また新しい単語をお届けします
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">今日のおすすめ単語</h2>
            <p className="text-xs text-gray-500">
              ニュースから抽出した上級語彙（CEFR C1-C2）
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddAll}
          className="text-sm px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
        >
          すべて追加
        </button>
      </div>

      {/* 単語カード */}
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-lg border border-amber-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* 単語・発音 */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-gray-900">
                    {rec.word}
                  </span>
                  {rec.pronunciation && (
                    <span className="text-gray-500 font-mono text-sm">
                      /{rec.pronunciation}/
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => speak(rec.word, "english")}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* タグ */}
                <div className="flex items-center gap-2 mb-2">
                  {rec.partOfSpeech && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {rec.partOfSpeech}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs rounded font-medium ${getCefrColor(
                      rec.cefrLevel
                    )}`}
                  >
                    {rec.cefrLevel}
                  </span>
                </div>

                {/* 定義 */}
                <p className="text-gray-600 text-sm line-clamp-2">
                  {rec.definition || "(定義を取得中...)"}
                </p>
              </div>

              {/* アクションボタン */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {processingId === rec.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(rec.id, false)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="スキップ"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(rec.id, true)}
                      className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="単語帳に追加"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッター */}
      <div className="mt-4 pt-4 border-t border-amber-200">
        <a
          href="/news"
          className="flex items-center justify-center gap-2 text-sm text-amber-700 hover:text-amber-800 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          ニュースを読んでもっと学ぶ
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
