import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

// 管理者チェック（仮実装）
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return user?.email ? adminEmails.includes(user.email) : false;
}

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 基本統計
    const [
      totalUsers,
      totalWords,
      totalArticles,
      totalActivities,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      activeUsersToday,
      wordsToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vocabularyWord.count(),
      prisma.article.count(),
      prisma.learningActivity.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.learningActivity.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: today } },
      }),
      prisma.vocabularyWord.count({ where: { createdAt: { gte: today } } }),
    ]);

    // サブスクリプション統計
    const subscriptionStats = await prisma.user.groupBy({
      by: ["subscriptionStatus"],
      _count: true,
    });

    // 言語レベル分布
    const languageLevelStats = await prisma.user.groupBy({
      by: ["languageLevel"],
      _count: true,
    });

    // 過去7日間の新規ユーザー数（日別）
    const dailyNewUsers = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "user"
      WHERE "createdAt" >= ${lastWeek}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // 過去7日間のアクティビティ（日別）
    const dailyActivities = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "LearningActivity"
      WHERE "createdAt" >= ${lastWeek}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalWords,
        totalArticles,
        totalActivities,
      },
      growth: {
        usersToday,
        usersThisWeek,
        usersThisMonth,
        activeUsersToday: activeUsersToday.length,
        wordsToday,
      },
      subscriptions: subscriptionStats.reduce((acc, item) => {
        const key = item.subscriptionStatus || "free";
        acc[key] = item._count;
        return acc;
      }, {} as Record<string, number>),
      languageLevels: languageLevelStats.reduce((acc, item) => {
        const key = item.languageLevel || "unknown";
        acc[key] = item._count;
        return acc;
      }, {} as Record<string, number>),
      charts: {
        dailyNewUsers: dailyNewUsers.map((d) => ({
          date: d.date,
          count: Number(d.count),
        })),
        dailyActivities: dailyActivities.map((d) => ({
          date: d.date,
          count: Number(d.count),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}

