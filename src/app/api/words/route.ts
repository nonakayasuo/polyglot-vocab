import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 単語一覧を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");

  try {
    let words = await prisma.vocabularyWord.findMany({
      where: language ? { language } : undefined,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    // displayOrderがすべて0の場合、createdAt順でdisplayOrderを初期化
    const allZero = words.every((w) => w.displayOrder === 0);
    if (allZero && words.length > 0) {
      const updates = words.map((w, index) =>
        prisma.vocabularyWord.update({
          where: { id: w.id },
          data: { displayOrder: index },
        }),
      );
      await Promise.all(updates);

      // 更新後のデータを再取得
      words = await prisma.vocabularyWord.findMany({
        where: language ? { language } : undefined,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      });
    }

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

    // 最大のdisplayOrderを取得して+1する
    const maxOrder = await prisma.vocabularyWord.aggregate({
      _max: { displayOrder: true },
      where: body.language ? { language: body.language } : undefined,
    });
    const nextOrder = (maxOrder._max.displayOrder ?? -1) + 1;

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
        displayOrder: nextOrder,
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
