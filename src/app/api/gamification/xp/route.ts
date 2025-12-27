import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

// レベル計算（指数関数的に増加）
function calculateLevel(totalXp: number): {
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
} {
  // レベル1から開始、各レベルに必要なXPは level * 100 * 1.5^(level-1)
  let level = 1;
  let xpNeeded = 100;
  let totalNeeded = 0;

  while (totalXp >= totalNeeded + xpNeeded) {
    totalNeeded += xpNeeded;
    level++;
    xpNeeded = Math.floor(level * 100 * 1.3 ** (level - 1));
  }

  return {
    level,
    xpToNextLevel: xpNeeded,
    xpProgress: totalXp - totalNeeded,
  };
}

export async function GET() {
  try {
    const session = await getServerSession();

    // 未ログイン時はデモデータを返す
    if (!session?.user) {
      const demoLevel = calculateLevel(0);
      return NextResponse.json({
        totalXp: 0,
        weeklyXp: 0,
        ...demoLevel,
      });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, weeklyXp: true },
    });

    const totalXp = user?.totalXp || 0;
    const weeklyXp = user?.weeklyXp || 0;
    const levelInfo = calculateLevel(totalXp);

    return NextResponse.json({
      totalXp,
      weeklyXp,
      ...levelInfo,
    });
  } catch (error) {
    console.error("Failed to get XP:", error);
    return NextResponse.json({ error: "Failed to get XP" }, { status: 500 });
  }
}
