"use client";

import {
  BookOpen,
  Calendar,
  Flame,
  Loader2,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StatsData {
  totalArticles: number;
  totalWordsLearned: number;
  totalReadTime: number;
  streak: number;
}

interface HistoryItem {
  id: string;
  readAt: string;
  wordsLearned: number;
  article: {
    id: string;
    title: string;
    source: string;
    imageUrl: string | null;
    publishedAt: string;
  };
}

export default function ReadingStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month" | "all">(
    "week"
  );

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/reading-history?period=${period}&limit=10`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch stats");
        }

        setStats(data.stats);
        setHistory(data.history || []);
      } catch (err) {
        console.error("Failed to fetch reading stats:", err);
        setError(
          err instanceof Error ? err.message : "統計の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  const formatReadTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分`;
    return `${Math.floor(seconds / 3600)}時間${Math.floor(
      (seconds % 3600) / 60
    )}分`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900">学習統計</h2>
        </div>
        <div className="flex gap-1">
          {(["day", "week", "month", "all"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                period === p
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p === "day"
                ? "今日"
                : p === "week"
                ? "今週"
                : p === "month"
                ? "今月"
                : "全期間"}
            </button>
          ))}
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {/* ストリーク */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">連続日数</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.streak || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">日</span>
          </div>
        </div>

        {/* 読んだ記事数 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">読んだ記事</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.totalArticles || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">本</span>
          </div>
        </div>

        {/* 学習した単語数 */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-gray-600">学習単語</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.totalWordsLearned || 0}
            <span className="text-sm font-normal text-gray-500 ml-1">語</span>
          </div>
        </div>

        {/* 読書時間 */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">読書時間</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatReadTime(stats?.totalReadTime || 0)}
          </div>
        </div>
      </div>

      {/* 最近読んだ記事 */}
      {history.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            最近読んだ記事
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {item.article.imageUrl && (
                  <img
                    src={item.article.imageUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.article.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.article.source}</span>
                    <span>•</span>
                    <span>
                      {new Date(item.readAt).toLocaleDateString("ja-JP")}
                    </span>
                    {item.wordsLearned > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600">
                          +{item.wordsLearned}語
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 履歴がない場合 */}
      {history.length === 0 && (
        <div className="px-4 pb-4">
          <div className="text-center text-gray-500 py-4">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">まだ記事を読んでいません</p>
            <p className="text-xs">
              News Readerで記事を読んで学習を始めましょう
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
