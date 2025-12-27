import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

/**
 * 単語帳をCSV形式でエクスポート
 * GET /api/words/export
 */
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ユーザーの単語を取得
    const words = await prisma.vocabularyWord.findMany({
      where: { userId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    if (words.length === 0) {
      return NextResponse.json(
        { error: "No words to export" },
        { status: 404 }
      );
    }

    // CSVヘッダー
    const headers = [
      "word",
      "meaning",
      "pronunciation",
      "example",
      "language",
      "category",
      "check1",
      "check2",
      "check3",
      "notes",
      "createdAt",
    ];

    // CSVデータを生成
    const csvRows: string[] = [];

    // ヘッダー行を追加
    csvRows.push(headers.join(","));

    // データ行を追加
    for (const word of words) {
      const row = [
        escapeCSV(word.word),
        escapeCSV(word.meaning || ""),
        escapeCSV(word.pronunciation || ""),
        escapeCSV(word.example || ""),
        escapeCSV(word.language || ""),
        escapeCSV(word.category || ""),
        word.check1 ? "true" : "false",
        word.check2 ? "true" : "false",
        word.check3 ? "true" : "false",
        escapeCSV(word.notes || ""),
        word.createdAt.toISOString(),
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    // CSVファイルとしてレスポンスを返す
    const filename = `newslingua-vocabulary-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export words:", error);
    return NextResponse.json(
      { error: "Failed to export words" },
      { status: 500 }
    );
  }
}

/**
 * CSV用にフィールドをエスケープ
 */
function escapeCSV(value: string): string {
  if (!value) return "";

  // カンマ、ダブルクォート、改行が含まれる場合はダブルクォートで囲む
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // ダブルクォートをエスケープ
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}

