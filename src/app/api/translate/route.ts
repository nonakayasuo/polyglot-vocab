import { type NextRequest, NextResponse } from "next/server";

// MyMemory Translation API (無料、APIキー不要)
const MYMEMORY_API = "https://api.mymemory.translated.net/get";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get("text");
  const from = searchParams.get("from") || "en";
  const to = searchParams.get("to") || "ja";

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`,
    );

    if (!response.ok) {
      throw new Error("Translation API error");
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData) {
      return NextResponse.json({
        translatedText: data.responseData.translatedText,
        match: data.responseData.match,
      });
    }

    // フォールバック: 翻訳失敗時は元のテキストを返す
    return NextResponse.json({
      translatedText: text,
      match: 0,
      error: "Translation unavailable",
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({
      translatedText: text,
      error: "Translation failed",
    });
  }
}
