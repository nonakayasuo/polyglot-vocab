import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();

    // 未ログイン時はデモデータを返す
    if (!session?.user) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveAt: new Date().toISOString(),
        streakFreezes: 0,
        isActiveToday: false,
      });
    }

    const userId = session.user.id;

    // ストリークを取得または作成
    let streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: { userId },
      });
    }

    // 今日アクティブかどうかをチェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = new Date(streak.lastActiveAt);
    lastActive.setHours(0, 0, 0, 0);
    const isActiveToday = today.getTime() === lastActive.getTime();

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveAt: streak.lastActiveAt.toISOString(),
      streakFreezes: streak.streakFreezes,
      isActiveToday,
    });
  } catch (error) {
    console.error("Failed to get streak:", error);
    return NextResponse.json(
      { error: "Failed to get streak" },
      { status: 500 }
    );
  }
}

// ストリークを更新
export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 既存のストリークを取得または作成
    let streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveAt: now,
        },
      });
    } else {
      const lastActive = new Date(streak.lastActiveAt);
      lastActive.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = streak.currentStreak;
      let newLongest = streak.longestStreak;

      if (daysDiff === 0) {
        // 今日すでにアクティブ - 変更なし
      } else if (daysDiff === 1) {
        // 連続日 - ストリーク増加
        newStreak = streak.currentStreak + 1;
        newLongest = Math.max(newLongest, newStreak);
      } else {
        // ストリーク途切れ - リセット（フリーズがあれば使用）
        if (streak.streakFreezes > 0 && daysDiff <= 2) {
          // フリーズ使用
          await prisma.userStreak.update({
            where: { userId },
            data: {
              streakFreezes: streak.streakFreezes - 1,
              lastActiveAt: now,
            },
          });
          newStreak = streak.currentStreak + 1;
          newLongest = Math.max(newLongest, newStreak);
        } else {
          newStreak = 1;
        }
      }

      streak = await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveAt: now,
        },
      });
    }

    // アクティビティログを記録
    await prisma.learningActivity.create({
      data: {
        userId,
        activityType: "daily_activity",
        xpEarned: 10,
        metadata: JSON.stringify({ streak: streak.currentStreak }),
      },
    });

    // ユーザーのXPを更新
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: 10 },
        weeklyXp: { increment: 10 },
      },
    });

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveAt: streak.lastActiveAt.toISOString(),
      streakFreezes: streak.streakFreezes,
      isActiveToday: true,
    });
  } catch (error) {
    console.error("Failed to update streak:", error);
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    );
  }
}
