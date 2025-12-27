"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  icon: string;
  requirement: number;
  xpReward: number;
  rarity: string;
  category: string;
  isActive: boolean;
}

interface UserAchievement {
  id: string;
  earnedAt: string;
  achievement: Achievement;
}

interface AchievementsData {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  progress: Record<string, number>;
}

const RARITY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; glow: string }
> = {
  common: {
    bg: "bg-slate-100 dark:bg-slate-700",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-600 dark:text-slate-400",
    glow: "",
  },
  rare: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-500/20",
  },
  epic: {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-600 dark:text-purple-400",
    glow: "shadow-purple-500/30",
  },
  legendary: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/40",
  },
};

const CATEGORY_INFO: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  vocabulary: {
    icon: BookOpen,
    label: "語彙",
    color: "text-blue-500",
  },
  mastery: {
    icon: CheckCircle2,
    label: "習得",
    color: "text-emerald-500",
  },
  reading: {
    icon: Target,
    label: "読書",
    color: "text-purple-500",
  },
  streak: {
    icon: Flame,
    label: "継続",
    color: "text-orange-500",
  },
  slang: {
    icon: Zap,
    label: "スラング",
    color: "text-pink-500",
  },
  community: {
    icon: Star,
    label: "コミュニティ",
    color: "text-cyan-500",
  },
};

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch("/api/gamification/achievements");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const earnedIds = new Set(
    data?.userAchievements.map((ua) => ua.achievement.id) || [],
  );
  const earnedCount = earnedIds.size;
  const totalCount = data?.achievements.length || 0;
  const totalXpEarned =
    data?.userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.xpReward,
      0,
    ) || 0;

  const categories = Array.from(
    new Set(data?.achievements.map((a) => a.category) || []),
  );

  const filteredAchievements = selectedCategory
    ? data?.achievements.filter((a) => a.category === selectedCategory)
    : data?.achievements;

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
              <Award className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                実績・バッジ
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* サマリーカード */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">あなたの実績</h1>
                  <p className="opacity-90">学習の成果を確認しましょう</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{earnedCount}</div>
                  <div className="text-sm opacity-90">獲得バッジ</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{totalCount}</div>
                  <div className="text-sm opacity-90">全バッジ</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{totalXpEarned}</div>
                  <div className="text-sm opacity-90">獲得XP</div>
                </div>
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                すべて
              </button>
              {categories.map((cat) => {
                const info = CATEGORY_INFO[cat] || {
                  icon: Star,
                  label: cat,
                  color: "text-slate-500",
                };
                const Icon = info.icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        selectedCategory === cat ? "" : info.color
                      }`}
                    />
                    {info.label}
                  </button>
                );
              })}
            </div>

            {/* バッジ一覧 */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements?.map((achievement) => {
                const isEarned = earnedIds.has(achievement.id);
                const earned = data?.userAchievements.find(
                  (ua) => ua.achievement.id === achievement.id,
                );
                const style =
                  RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;
                const catInfo = CATEGORY_INFO[achievement.category];
                const progress =
                  data?.progress[achievement.id.replace(/-/g, "_")] || 0;
                const progressPercent = Math.min(
                  (progress / achievement.requirement) * 100,
                  100,
                );

                return (
                  <div
                    key={achievement.id}
                    className={`relative rounded-xl border-2 p-4 transition-all ${
                      isEarned
                        ? `${style.bg} ${style.border} shadow-lg ${style.glow}`
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70"
                    }`}
                  >
                    {/* レアリティバッジ */}
                    {achievement.rarity !== "common" && (
                      <div
                        className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}
                      >
                        {achievement.rarity === "legendary" && (
                          <Crown className="w-3 h-3 inline mr-1" />
                        )}
                        {achievement.rarity.toUpperCase()}
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* アイコン */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          isEarned ? style.bg : "bg-slate-100 dark:bg-slate-700"
                        }`}
                      >
                        {isEarned ? (
                          achievement.icon
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold truncate ${
                            isEarned
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {achievement.nameJa || achievement.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {achievement.descriptionJa || achievement.description}
                        </p>

                        {/* 進捗バー（未獲得時） */}
                        {!isEarned && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>
                                {progress} / {achievement.requirement}
                              </span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* 獲得日（獲得時） */}
                        {isEarned && earned && (
                          <div className="flex items-center gap-2 mt-2">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-slate-500">
                              {new Date(earned.earnedAt).toLocaleDateString(
                                "ja-JP",
                              )}
                              に獲得
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* XP報酬 */}
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        {catInfo && (
                          <>
                            <catInfo.icon
                              className={`w-3 h-3 ${catInfo.color}`}
                            />
                            <span className="text-slate-500">
                              {catInfo.label}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Zap className="w-3 h-3" />
                        <span>+{achievement.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* バッジがない場合 */}
            {filteredAchievements?.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  このカテゴリにはバッジがありません
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
