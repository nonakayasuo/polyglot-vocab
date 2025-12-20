import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: 複数の単語を一括インポート
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const words = body.words as Array<{
      word: string;
      pronunciation?: string;
      category?: string;
      meaning?: string;
      example?: string;
      note?: string;
      language?: string;
      check1?: boolean;
      check2?: boolean;
      check3?: boolean;
    }>;

    // 重複チェック用に既存の単語を取得
    const existingWords = await prisma.vocabularyWord.findMany({
      select: { word: true, language: true },
    });

    const existingSet = new Set(
      existingWords.map((w) => `${w.word}-${w.language}`),
    );

    // 重複を除外
    const newWords = words.filter(
      (w) => !existingSet.has(`${w.word}-${w.language || "english"}`),
    );

    if (newWords.length === 0) {
      return NextResponse.json({
        imported: 0,
        message: "No new words to import",
      });
    }

    // 一括作成
    const result = await prisma.vocabularyWord.createMany({
      data: newWords.map((w) => ({
        word: w.word,
        pronunciation: w.pronunciation || "",
        category: w.category || "Noun",
        meaning: w.meaning || "",
        example: w.example || "",
        note: w.note || "",
        language: w.language || "english",
        check1: w.check1 || false,
        check2: w.check2 || false,
        check3: w.check3 || false,
      })),
    });

    return NextResponse.json({
      imported: result.count,
      message: `${result.count} words imported successfully`,
    });
  } catch (error) {
    console.error("Failed to import words:", error);
    return NextResponse.json(
      { error: "Failed to import words" },
      { status: 500 },
    );
  }
}

// DELETE: 複数の単語を一括削除
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids as string[];

    const result = await prisma.vocabularyWord.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `${result.count} words deleted successfully`,
    });
  } catch (error) {
    console.error("Failed to delete words:", error);
    return NextResponse.json(
      { error: "Failed to delete words" },
      { status: 500 },
    );
  }
}

