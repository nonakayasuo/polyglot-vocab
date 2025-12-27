import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  analyzeTextDifficulty,
  getWordDifficulty,
} from "@/lib/word-difficulty";

// GET: 単語の難易度を分析
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json(
      { error: "word parameter is required" },
      { status: 400 },
    );
  }

  const difficulty = getWordDifficulty(word);

  if (!difficulty) {
    return NextResponse.json(
      { error: "Word not found in difficulty database", word },
      { status: 404 },
    );
  }

  return NextResponse.json(difficulty);
}

// POST: テキストの難易度を分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language = "english" } = body;

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // ユーザーの既知語彙を取得
    const userWords = await prisma.vocabularyWord.findMany({
      where: { language },
      select: { word: true },
    });
    const knownWords = new Set(userWords.map((w) => w.word.toLowerCase()));

    // テキストを分析
    const analysis = analyzeTextDifficulty(text, knownWords);

    return NextResponse.json({
      ...analysis,
      knownWordsCount: knownWords.size,
    });
  } catch (error) {
    console.error("Failed to analyze text:", error);
    return NextResponse.json(
      { error: "Failed to analyze text" },
      { status: 500 },
    );
  }
}
