import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 特定の単語を取得
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const word = await prisma.vocabularyWord.findUnique({
      where: { id },
    });

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error("Failed to fetch word:", error);
    return NextResponse.json(
      { error: "Failed to fetch word" },
      { status: 500 },
    );
  }
}

// PATCH: 単語を更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();

    const word = await prisma.vocabularyWord.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(word);
  } catch (error) {
    console.error("Failed to update word:", error);
    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 },
    );
  }
}

// DELETE: 単語を削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.vocabularyWord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete word:", error);
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 },
    );
  }
}

