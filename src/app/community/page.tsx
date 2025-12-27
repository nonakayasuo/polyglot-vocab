"use client";

import {
  ArrowLeft,
  BookOpen,
  Crown,
  Flame,
  Medal,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  weeklyXp: number;
  totalXp: number;
  currentStreak: number;
  level: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser?: LeaderboardEntry & { rank: number };
}

const RANK_STYLES: Record<
  number,
  { icon: React.ElementType; color: string; bg: string }
> = {
  1: {
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  2: {
    icon: Medal,
    color: "text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-700",
  },
  3: {
    icon: Medal,
    color: "text-amber-700",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
};

export default function CommunityPage() {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"weekly" | "allTime">("weekly");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(
          `/api/gamification/leaderboard?period=${period}`,
        );
        if (res.ok) {
          const data = await res.json();
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ホーム</span>
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                コミュニティ
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">コミュニティ</h1>
              <p className="opacity-90">仲間と一緒に学習を続けよう</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">週間ランキング</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">ディスカッション</div>
            </div>
          </div>
        </div>

        {/* 週間 / 全期間 切り替え */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              period === "weekly"
                ? "bg-purple-500 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Flame className="w-4 h-4 inline mr-2" />
            今週のランキング
          </button>
          <button
            type="button"
            onClick={() => setPeriod("allTime")}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              period === "allTime"
                ? "bg-purple-500 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            総合ランキング
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 現在のユーザーランク */}
            {leaderboardData?.currentUser && (
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                      {leaderboardData.currentUser.rank}
                    </div>
                    <div>
                      <div className="font-semibold">あなたの順位</div>
                      <div className="text-sm opacity-90">
                        レベル {leaderboardData.currentUser.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {period === "weekly"
                        ? leaderboardData.currentUser.weeklyXp
                        : leaderboardData.currentUser.totalXp}{" "}
                      XP
                    </div>
                    <div className="text-sm opacity-90 flex items-center gap-1 justify-end">
                      <Flame className="w-4 h-4" />
                      {leaderboardData.currentUser.currentStreak}日連続
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* リーダーボード */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  {period === "weekly" ? "今週の" : ""}トップ学習者
                </h2>
              </div>

              {leaderboardData?.leaderboard &&
              leaderboardData.leaderboard.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {leaderboardData.leaderboard.map((entry, index) => {
                    const rankStyle = RANK_STYLES[index + 1];
                    const RankIcon = rankStyle?.icon || Target;

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-4 p-4 ${
                          rankStyle ? rankStyle.bg : ""
                        }`}
                      >
                        {/* 順位 */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            rankStyle
                              ? rankStyle.color
                              : "text-slate-400 bg-slate-100 dark:bg-slate-700"
                          }`}
                        >
                          {index < 3 ? (
                            <RankIcon className="w-5 h-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        {/* ユーザー情報 */}
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {entry.name || `User ${entry.userId.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Lv.{entry.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {entry.currentStreak}日
                            </span>
                          </div>
                        </div>

                        {/* XP */}
                        <div className="text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {period === "weekly"
                              ? entry.weeklyXp
                              : entry.totalXp}
                          </div>
                          <div className="text-xs text-slate-500">XP</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">
                    まだランキングデータがありません
                  </p>
                  <p className="text-sm text-slate-400">
                    学習を続けてランキングに参加しましょう！
                  </p>
                </div>
              )}
            </div>

            {/* 学習を始める */}
            <div className="mt-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center">
              <Zap className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                学習してXPを獲得しよう
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                ニュースを読んだり単語を覚えたりしてXPを稼ごう
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  ニュースを読む
                </Link>
                <Link
                  href="/english"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  単語帳
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
