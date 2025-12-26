import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 読書履歴と統計を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "week"; // day, week, month, all
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10);

  try {
    // 期間の開始日を計算
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // 全期間
    }

    // 読書履歴を取得
    const history = await prisma.readingHistory.findMany({
      where: {
        readAt: { gte: startDate },
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            source: true,
            imageUrl: true,
            publishedAt: true,
          },
        },
      },
      orderBy: { readAt: "desc" },
      take: limit,
    });

    // 統計を計算
    const stats = await prisma.readingHistory.aggregate({
      where: {
        readAt: { gte: startDate },
      },
      _count: true,
      _sum: {
        wordsLearned: true,
        readTime: true,
      },
    });

    // 日別の読書数を集計
    const dailyStats = await prisma.readingHistory.groupBy({
      by: ["readAt"],
      where: {
        readAt: { gte: startDate },
      },
      _count: true,
      _sum: {
        wordsLearned: true,
      },
    });

    // ストリーク計算（連続学習日数）
    const streak = await calculateStreak();

    return NextResponse.json({
      history,
      stats: {
        totalArticles: stats._count,
        totalWordsLearned: stats._sum.wordsLearned || 0,
        totalReadTime: stats._sum.readTime || 0,
        streak,
      },
      dailyStats: dailyStats.map((d) => ({
        date: d.readAt,
        count: d._count,
        wordsLearned: d._sum.wordsLearned || 0,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch reading history:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading history" },
      { status: 500 }
    );
  }
}

// POST: 読書履歴を記録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, wordsLearned = 0, readTime } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    // 記事が存在するか確認
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // 読書履歴を作成
    const history = await prisma.readingHistory.create({
      data: {
        articleId,
        wordsLearned,
        readTime,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to record reading history:", error);
    return NextResponse.json(
      { error: "Failed to record reading history" },
      { status: 500 }
    );
  }
}

// ストリーク（連続学習日数）を計算
async function calculateStreak(): Promise<number> {
  const histories = await prisma.readingHistory.findMany({
    orderBy: { readAt: "desc" },
    select: { readAt: true },
  });

  if (histories.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 日付をユニークに抽出
  const uniqueDates = new Set<string>();
  for (const h of histories) {
    const date = new Date(h.readAt);
    date.setHours(0, 0, 0, 0);
    uniqueDates.add(date.toISOString());
  }

  const sortedDates = Array.from(uniqueDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // 今日または昨日から連続しているかチェック
  const checkDate = new Date(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 今日の記録がない場合、昨日から開始
  if (sortedDates[0]?.getTime() !== today.getTime()) {
    if (sortedDates[0]?.getTime() !== yesterday.getTime()) {
      return 0; // ストリーク切れ
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (const date of sortedDates) {
    if (date.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (date.getTime() < checkDate.getTime()) {
      break; // 連続が途切れた
    }
  }

  return streak;
}

