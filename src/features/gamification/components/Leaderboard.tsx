"use client";

import { Crown, Flame, Medal, TrendingUp, Trophy, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  type: string;
  leaderboard: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  lastUpdated: string;
}

type LeaderboardType = "weekly" | "all-time";

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<LeaderboardType>("weekly");

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/gamification/leaderboard?type=${type}&limit=10`,
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [type]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 text-center font-semibold text-gray-500">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200";
    }
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          {[...Array(5)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: ローディング用の固定スケルトン
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            ランキング
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            リアルタイム更新
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("weekly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              type === "weekly"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            今週
          </button>
          <button
            type="button"
            onClick={() => setType("all-time")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              type === "all-time"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            累計
          </button>
        </div>
      </div>

      {/* ランキングリスト */}
      <div className="p-4 space-y-2">
        {data?.leaderboard && data.leaderboard.length > 0 ? (
          <>
            {data.leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${getRankBg(
                  entry.rank,
                  entry.isCurrentUser,
                )}`}
              >
                {/* 順位 */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* アバター */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center overflow-hidden">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* 名前 */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      entry.isCurrentUser ? "text-indigo-700" : "text-gray-900"
                    }`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        あなた
                      </span>
                    )}
                  </p>
                  {entry.streak > 0 && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {entry.streak}日連続
                    </p>
                  )}
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>
            ))}

            {/* 現在のユーザー（ランキング外の場合） */}
            {data.currentUserRank && (
              <>
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-xs text-gray-400">あなたの順位</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(
                    data.currentUserRank.rank,
                    true,
                  )}`}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(data.currentUserRank.rank)}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center overflow-hidden">
                    {data.currentUserRank.image ? (
                      <Image
                        src={data.currentUserRank.image}
                        alt={data.currentUserRank.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-indigo-700">
                      {data.currentUserRank.name}
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        あなた
                      </span>
                    </p>
                    {data.currentUserRank.streak > 0 && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {data.currentUserRank.streak}日連続
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {data.currentUserRank.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">まだランキングデータがありません</p>
            <p className="text-sm mt-1">学習を始めてランキングに参加しよう！</p>
          </div>
        )}
      </div>
    </div>
  );
}
