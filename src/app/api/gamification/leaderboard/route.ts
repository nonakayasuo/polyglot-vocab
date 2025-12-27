import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "weekly"; // "weekly" | "all-time"
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

    const session = await getServerSession();
    const currentUserId = session?.user?.id;

    // ランキングデータ取得
    const orderByField = type === "weekly" ? "weeklyXp" : "totalXp";

    const topUsers = await prisma.user.findMany({
      where: {
        [orderByField]: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        image: true,
        totalXp: true,
        weeklyXp: true,
        streak: {
          select: {
            currentStreak: true,
          },
        },
      },
      orderBy: {
        [orderByField]: "desc",
      },
      take: limit,
    });

    // ランキングデータを整形
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || "Anonymous",
      image: user.image,
      xp: type === "weekly" ? user.weeklyXp : user.totalXp,
      streak: user.streak?.currentStreak || 0,
      isCurrentUser: user.id === currentUserId,
    }));

    // 現在のユーザーのランキング（トップ外の場合）
    let currentUserRank = null;
    if (currentUserId) {
      const userInTop = leaderboard.find((u) => u.isCurrentUser);

      if (!userInTop) {
        // 現在のユーザーの順位を計算
        const currentUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: {
            id: true,
            name: true,
            image: true,
            totalXp: true,
            weeklyXp: true,
            streak: {
              select: {
                currentStreak: true,
              },
            },
          },
        });

        if (currentUser) {
          const userXp =
            type === "weekly" ? currentUser.weeklyXp : currentUser.totalXp;
          const higherCount = await prisma.user.count({
            where: {
              [orderByField]: { gt: userXp },
            },
          });

          currentUserRank = {
            rank: higherCount + 1,
            id: currentUser.id,
            name: currentUser.name || "Anonymous",
            image: currentUser.image,
            xp: userXp,
            streak: currentUser.streak?.currentStreak || 0,
            isCurrentUser: true,
          };
        }
      }
    }

    return NextResponse.json({
      type,
      leaderboard,
      currentUserRank,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to get leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to get leaderboard" },
      { status: 500 },
    );
  }
}

// 週間XPをリセット（cronジョブで呼び出し）
export async function POST(request: NextRequest) {
  try {
    // シークレットキーで認証
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 全ユーザーの週間XPをリセット
    await prisma.user.updateMany({
      data: {
        weeklyXp: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Weekly XP reset completed",
      resetAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to reset weekly XP:", error);
    return NextResponse.json(
      { error: "Failed to reset weekly XP" },
      { status: 500 },
    );
  }
}
