import { NextResponse } from "next/server";
import { fetchAvailableSources } from "@/lib/news-api";
import { NEWS_SOURCES } from "@/types/news";

// GET: 利用可能なニュースソース一覧を取得
export async function GET() {
  try {
    // まずローカル定義のソースを返す（高速）
    // 必要に応じてNews APIから動的に取得することも可能
    const localSources = NEWS_SOURCES.map((source) => ({
      id: source.id,
      name: source.name,
      icon: source.icon,
      language: source.language,
    }));

    return NextResponse.json({
      sources: localSources,
      total: localSources.length,
    });
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch news sources" },
      { status: 500 }
    );
  }
}

// APIから動的にソースを取得する場合（オプション）
export async function fetchDynamicSources() {
  try {
    const sources = await fetchAvailableSources();
    return sources;
  } catch (error) {
    console.error("Failed to fetch dynamic sources:", error);
    return NEWS_SOURCES;
  }
}

