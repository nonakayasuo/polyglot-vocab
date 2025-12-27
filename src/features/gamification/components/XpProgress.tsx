"use client";

import { Sparkles, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface XpData {
  totalXp: number;
  weeklyXp: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
}

export function XpProgress() {
  const [xp, setXp] = useState<XpData>({
    totalXp: 0,
    weeklyXp: 0,
    level: 1,
    xpToNextLevel: 100,
    xpProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchXp() {
      try {
        const response = await fetch("/api/gamification/xp");
        if (response.ok) {
          const data = await response.json();
          setXp(data);
        }
      } catch (error) {
        console.error("Failed to fetch XP:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchXp();
  }, []);

  if (loading) {
    return <div className="animate-pulse w-full h-16 bg-gray-100 rounded-xl" />;
  }

  const progressPercent = Math.min(
    (xp.xpProgress / xp.xpToNextLevel) * 100,
    100,
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 text-white">
      {/* 背景パーティクル */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Sparkles
            // biome-ignore lint/suspicious/noArrayIndexKey: 装飾用の固定パーティクル
            key={i}
            className="absolute w-4 h-4 text-white/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {/* レベルバッジ */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <p className="text-xs text-white/70">レベル</p>
              <p className="text-xl font-bold">{xp.level}</p>
            </div>
          </div>

          {/* 週間XP */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/70 text-xs">
              <Zap className="w-3 h-3" />
              <span>今週</span>
            </div>
            <p className="font-semibold">{xp.weeklyXp.toLocaleString()} XP</p>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 via-yellow-200 to-white rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-white/70">
          <span>{xp.xpProgress.toLocaleString()} XP</span>
          <span>
            次のレベルまで {(xp.xpToNextLevel - xp.xpProgress).toLocaleString()}{" "}
            XP
          </span>
        </div>
      </div>
    </div>
  );
}
