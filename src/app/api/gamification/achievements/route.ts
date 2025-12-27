import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    // すべての達成可能なバッジを取得
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { requirement: "asc" }],
    });

    // ユーザーの獲得バッジを取得
    let userAchievements: Array<{
      id: string;
      earnedAt: Date;
      achievement: (typeof achievements)[0];
    }> = [];
    let progress: Record<string, number> = {};

    if (session?.user) {
      const userId = session.user.id;

      userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      });

      // 進捗を計算
      const [wordCount, masteredCount, articleCount] = await Promise.all([
        prisma.vocabularyWord.count(),
        prisma.vocabularyWord.count({
          where: { check1: true, check2: true, check3: true },
        }),
        prisma.readingHistory.count(),
      ]);

      const streak = await prisma.userStreak.findUnique({
        where: { userId },
      });

      progress = {
        // 語彙系
        first_word: wordCount,
        vocabulary_10: wordCount,
        vocabulary_50: wordCount,
        vocabulary_100: wordCount,
        vocabulary_500: wordCount,
        vocabulary_1000: wordCount,
        // マスター系
        mastered_10: masteredCount,
        mastered_50: masteredCount,
        mastered_100: masteredCount,
        // 読書系
        first_article: articleCount,
        articles_10: articleCount,
        articles_50: articleCount,
        articles_100: articleCount,
        // ストリーク系
        streak_3: streak?.currentStreak || 0,
        streak_7: streak?.currentStreak || 0,
        streak_30: streak?.currentStreak || 0,
        streak_100: streak?.currentStreak || 0,
      };
    }

    return NextResponse.json({
      achievements,
      userAchievements: userAchievements.map((ua) => ({
        id: ua.id,
        earnedAt: ua.earnedAt.toISOString(),
        achievement: ua.achievement,
      })),
      progress,
    });
  } catch (error) {
    console.error("Failed to get achievements:", error);
    return NextResponse.json(
      { error: "Failed to get achievements" },
      { status: 500 }
    );
  }
}

// バッジ獲得チェック（学習アクティビティ時に呼ばれる）
export async function POST() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 現在の進捗を取得
    const [wordCount, masteredCount, articleCount, streak] = await Promise.all([
      prisma.vocabularyWord.count(),
      prisma.vocabularyWord.count({
        where: { check1: true, check2: true, check3: true },
      }),
      prisma.readingHistory.count(),
      prisma.userStreak.findUnique({ where: { userId } }),
    ]);

    // 既に獲得済みのバッジを取得
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const earnedIds = new Set(existingAchievements.map((a) => a.achievementId));

    // 達成条件をチェック
    const progressMap: Record<string, number> = {
      vocabulary: wordCount,
      mastery: masteredCount,
      reading: articleCount,
      streak: streak?.currentStreak || 0,
    };

    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    const newAchievements: typeof allAchievements = [];

    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue;

      // カテゴリに応じた進捗を確認
      let currentProgress = 0;
      switch (achievement.category) {
        case "vocabulary":
          currentProgress = wordCount;
          break;
        case "mastery":
          currentProgress = masteredCount;
          break;
        case "reading":
          currentProgress = articleCount;
          break;
        case "streak":
          currentProgress = streak?.currentStreak || 0;
          break;
      }

      if (currentProgress >= achievement.requirement) {
        // バッジ獲得！
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: currentProgress,
          },
        });

        // XP報酬を付与
        if (achievement.xpReward > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              totalXp: { increment: achievement.xpReward },
              weeklyXp: { increment: achievement.xpReward },
            },
          });
        }

        newAchievements.push(achievement);
      }
    }

    return NextResponse.json({
      newAchievements: newAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        nameJa: a.nameJa,
        icon: a.icon,
        xpReward: a.xpReward,
        rarity: a.rarity,
      })),
    });
  } catch (error) {
    console.error("Failed to check achievements:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}
