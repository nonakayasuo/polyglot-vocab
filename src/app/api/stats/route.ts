import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 統計情報を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");

  try {
    const where = language ? { language } : undefined;

    const words = await prisma.vocabularyWord.findMany({
      where,
      select: {
        language: true,
        category: true,
        check1: true,
        check2: true,
        check3: true,
      },
    });

    const stats = {
      total: words.length,
      mastered: 0,
      learning: 0,
      notStarted: 0,
      byLanguage: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    words.forEach((word) => {
      // ステータスカウント
      const checks = [word.check1, word.check2, word.check3].filter(
        Boolean,
      ).length;
      if (checks === 3) stats.mastered++;
      else if (checks > 0) stats.learning++;
      else stats.notStarted++;

      // 言語別カウント
      stats.byLanguage[word.language] =
        (stats.byLanguage[word.language] || 0) + 1;

      // カテゴリ別カウント
      if (word.category) {
        stats.byCategory[word.category] =
          (stats.byCategory[word.category] || 0) + 1;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}

