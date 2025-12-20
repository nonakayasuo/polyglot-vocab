import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 単語一覧を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");

  try {
    const words = await prisma.vocabularyWord.findMany({
      where: language ? { language } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error("Failed to fetch words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 },
    );
  }
}

// POST: 新しい単語を追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const word = await prisma.vocabularyWord.create({
      data: {
        word: body.word,
        pronunciation: body.pronunciation || "",
        category: body.category || "Noun",
        meaning: body.meaning || "",
        example: body.example || "",
        note: body.note || "",
        language: body.language || "english",
        check1: body.check1 || false,
        check2: body.check2 || false,
        check3: body.check3 || false,
      },
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error("Failed to create word:", error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 },
    );
  }
}

