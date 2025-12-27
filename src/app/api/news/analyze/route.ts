// 記事難易度分析APIエンドポイント
import { type NextRequest, NextResponse } from "next/server";
import {
  analyzeArticleDifficulty,
  isArticleSuitableForLevel,
} from "@/lib/article-difficulty";
import type { CEFRLevel } from "@/lib/word-difficulty";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, userLevel, userKnownWords } = body as {
      text: string;
      userLevel?: CEFRLevel;
      userKnownWords?: string[];
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // ユーザーの既知単語セット
    const knownWordsSet = new Set(userKnownWords || []);

    // 難易度分析
    const result = analyzeArticleDifficulty(text, knownWordsSet);

    // ユーザーレベルとの適合性チェック
    let suitability = null;
    if (userLevel) {
      suitability = isArticleSuitableForLevel(result.cefrLevel, userLevel);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        suitability,
      },
    });
  } catch (error) {
    console.error("Article analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze article" },
      { status: 500 },
    );
  }
}
