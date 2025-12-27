"use client";

import { Lock } from "lucide-react";

interface Achievement {
  id: string;
  code: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  icon: string;
  category: string;
  requirement: number;
  xpReward: number;
  rarity: string;
}

interface UserAchievement {
  id: string;
  earnedAt: string;
  achievement: Achievement;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: UserAchievement;
  progress?: number;
  showDetails?: boolean;
}

const rarityStyles = {
  common: {
    bg: "from-gray-100 to-gray-200",
    border: "border-gray-300",
    glow: "",
    text: "text-gray-600",
  },
  rare: {
    bg: "from-blue-100 to-blue-200",
    border: "border-blue-400",
    glow: "shadow-blue-500/20",
    text: "text-blue-600",
  },
  epic: {
    bg: "from-purple-100 to-purple-200",
    border: "border-purple-400",
    glow: "shadow-purple-500/30",
    text: "text-purple-600",
  },
  legendary: {
    bg: "from-amber-100 via-yellow-200 to-amber-100",
    border: "border-amber-400",
    glow: "shadow-amber-500/40",
    text: "text-amber-600",
  },
};

export function AchievementBadge({
  achievement,
  earned,
  progress = 0,
  showDetails = false,
}: AchievementBadgeProps) {
  const rarity = achievement.rarity as keyof typeof rarityStyles;
  const styles = rarityStyles[rarity] || rarityStyles.common;
  const isEarned = !!earned;
  const progressPercent = Math.min(
    (progress / achievement.requirement) * 100,
    100
  );

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300
        ${
          isEarned
            ? "hover:scale-105"
            : "hover:scale-102 opacity-70 hover:opacity-100"
        }
      `}
    >
      {/* バッジ本体 */}
      <div
        className={`
          relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center
          transition-all duration-300
          ${
            isEarned
              ? `bg-gradient-to-br ${styles.bg} ${styles.border} shadow-lg ${styles.glow}`
              : "bg-gray-100 border-gray-200 grayscale"
          }
        `}
      >
        {/* アイコン */}
        <span className={`text-3xl ${isEarned ? "" : "opacity-50"}`}>
          {achievement.icon}
        </span>

        {/* 未獲得のロックアイコン */}
        {!isEarned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-2xl">
            <Lock className="w-4 h-4 text-gray-400 absolute bottom-2 right-2" />
          </div>
        )}

        {/* レジェンダリーのキラキラエフェクト */}
        {isEarned && rarity === "legendary" && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        )}
      </div>

      {/* 進捗バー（未獲得時） */}
      {!isEarned && progress > 0 && (
        <div className="absolute -bottom-1 left-2 right-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* ツールチップ */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 rounded-xl text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{achievement.icon}</span>
          <div>
            <p className="font-semibold">{achievement.nameJa}</p>
            <p className={`text-[10px] uppercase tracking-wide ${styles.text}`}>
              {rarity}
            </p>
          </div>
        </div>
        <p className="text-slate-300 mb-2">{achievement.descriptionJa}</p>
        {isEarned ? (
          <p className="text-emerald-400 text-[10px]">
            ✓ {new Date(earned.earnedAt).toLocaleDateString("ja-JP")} 獲得
          </p>
        ) : (
          <p className="text-slate-400 text-[10px]">
            進捗: {progress} / {achievement.requirement}
          </p>
        )}
        {achievement.xpReward > 0 && (
          <p className="text-amber-400 text-[10px] mt-1">
            +{achievement.xpReward} XP
          </p>
        )}
        {/* 矢印 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}

// バッジグリッド表示
interface AchievementGridProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  progress?: Record<string, number>;
  category?: string;
}

export function AchievementGrid({
  achievements,
  userAchievements,
  progress = {},
  category,
}: AchievementGridProps) {
  const filteredAchievements = category
    ? achievements.filter((a) => a.category === category)
    : achievements;

  const earnedMap = new Map(
    userAchievements.map((ua) => [ua.achievement.id, ua])
  );

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {filteredAchievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          earned={earnedMap.get(achievement.id)}
          progress={progress[achievement.code] || 0}
        />
      ))}
    </div>
  );
}
