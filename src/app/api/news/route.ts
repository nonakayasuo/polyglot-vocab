import { type NextRequest, NextResponse } from "next/server";
import { fetchArticlesWithCache, searchArticles } from "@/lib/news-api";
import type { Article, NewsCategory } from "@/types/news";

// GET: ニュース記事一覧を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") as NewsCategory | null;
  const language = searchParams.get("language") || "en";
  const source = searchParams.get("source") || undefined;
  const query = searchParams.get("q") || undefined;
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "20", 10);
  const page = Number.parseInt(searchParams.get("page") || "1", 10);

  try {
    let articles: Article[] = [];

    if (query) {
      // 検索クエリがある場合
      articles = await searchArticles(query, {
        language,
        source,
        pageSize,
        page,
      });
    } else {
      // トップヘッドライン取得
      articles = await fetchArticlesWithCache({
        category: category || "general",
        language,
        source,
        pageSize,
        page,
      });
    }

    return NextResponse.json({
      articles,
      total: articles.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Failed to fetch news:", error);

    // APIキー未設定の場合
    if (error instanceof Error && error.message.includes("NEWS_API_KEY")) {
      return NextResponse.json(
        {
          error: "News API is not configured",
          message: "Please set NEWS_API_KEY in your environment variables",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch news articles" },
      { status: 500 },
    );
  }
}
