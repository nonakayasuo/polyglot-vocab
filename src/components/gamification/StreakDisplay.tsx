"use client";

import { Flame, Snowflake, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string;
  streakFreezes: number;
  isActiveToday: boolean;
}

interface StreakDisplayProps {
  compact?: boolean;
}

export function StreakDisplay({ compact = false }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch("/api/gamification/streak");
        if (response.ok) {
          const data = await response.json();
          setStreak(data);
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div
        className={`animate-pulse ${compact ? "w-16 h-8" : "w-full h-24"} bg-gray-100 rounded-xl`}
      />
    );
  }

  // デモデータ（未ログイン時）
  const displayStreak = streak || {
    currentStreak: 0,
    longestStreak: 0,
    streakFreezes: 0,
    isActiveToday: false,
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-semibold text-sm shadow-lg shadow-orange-500/25">
        <Flame className="w-4 h-4" />
        <span>{displayStreak.currentStreak}</span>
      </div>
    );
  }

  const getStreakColor = (count: number) => {
    if (count >= 30) return "from-purple-500 to-pink-500";
    if (count >= 7) return "from-orange-500 to-red-500";
    if (count >= 3) return "from-yellow-500 to-orange-500";
    return "from-gray-400 to-gray-500";
  };

  const getStreakMessage = (count: number, isActiveToday: boolean) => {
    if (!isActiveToday && count > 0)
      return "今日も学習してストリークを維持しよう！";
    if (count >= 100) return "🏆 伝説のストリーク！";
    if (count >= 30) return "🌟 素晴らしい！1ヶ月達成！";
    if (count >= 7) return "⚡ 1週間継続中！";
    if (count >= 3) return "🔥 いい調子！";
    if (count >= 1) return "✨ 継続は力なり！";
    return "今日から始めよう！";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            学習ストリーク
          </h3>
          {displayStreak.streakFreezes > 0 && (
            <div className="flex items-center gap-1 text-xs text-cyan-300">
              <Snowflake className="w-4 h-4" />
              <span>フリーズ {displayStreak.streakFreezes}回</span>
            </div>
          )}
        </div>

        <div className="flex items-end gap-6">
          {/* メインストリーク表示 */}
          <div className="flex-1">
            <div
              className={`text-6xl font-bold bg-gradient-to-r ${getStreakColor(displayStreak.currentStreak)} bg-clip-text text-transparent`}
            >
              {displayStreak.currentStreak}
            </div>
            <p className="text-sm text-slate-400 mt-1">連続日数</p>
          </div>

          {/* 最長記録 */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>最長記録</span>
            </div>
            <div className="text-2xl font-semibold text-slate-300">
              {displayStreak.longestStreak}
            </div>
          </div>
        </div>

        {/* メッセージ */}
        <p className="mt-4 text-sm text-slate-300">
          {getStreakMessage(
            displayStreak.currentStreak,
            displayStreak.isActiveToday ?? false,
          )}
        </p>

        {/* 今日のステータス */}
        <div className="mt-4 flex items-center gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 週の7日間を表す固定配列
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                i < displayStreak.currentStreak % 7
                  ? "bg-gradient-to-r from-orange-400 to-red-500"
                  : "bg-slate-700"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">今週の進捗</p>
      </div>
    </div>
  );
}
