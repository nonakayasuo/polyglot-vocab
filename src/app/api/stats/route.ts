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
      },
    });

    const stats = {
      total: words.length,
      mastered: 0, // 習得済み（check1 = true）
      notStarted: 0, // 未習得（check1 = false）
      byLanguage: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    words.forEach((word) => {
      // 習得済みカウント（check1がtrueなら習得済み）
      if (word.check1) {
        stats.mastered++;
      } else {
        stats.notStarted++;
      }

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
