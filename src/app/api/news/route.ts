import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchArticlesWithCache, searchArticles } from "@/lib/news-api";
import { prisma } from "@/lib/prisma";
import type { Article, NewsCategory } from "@/types/news";

// カテゴリのマッピング（コンテンツ設定 → News API）
const CATEGORY_MAPPING: Record<string, NewsCategory[]> = {
  news: ["general"],
  entertainment: ["entertainment"],
  sports: ["sports"],
  tech: ["technology"],
  culture: ["entertainment"],
  gossip: ["entertainment"], // 18+
  kpop: ["entertainment"],
  anime: ["entertainment"],
  gaming: ["technology", "entertainment"],
};

// GET: ニュース記事一覧を取得（コンテンツ設定を反映）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") as NewsCategory | null;
  const language = searchParams.get("language") || "en";
  const source = searchParams.get("source") || undefined;
  const query = searchParams.get("q") || undefined;
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "20", 10);
  const page = Number.parseInt(searchParams.get("page") || "1", 10);

  try {
    // ユーザーのコンテンツ設定を取得（ログイン時のみ）
    let userSettings: {
      preferredCategories: string[];
      blockedCategories: string[];
      adultContentEnabled: boolean;
    } | null = null;

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        const settings = await prisma.userContentSettings.findUnique({
          where: { userId: session.user.id },
        });

        if (settings) {
          userSettings = {
            preferredCategories: JSON.parse(settings.preferredCategories),
            blockedCategories: JSON.parse(settings.blockedCategories),
            adultContentEnabled: settings.adultContentEnabled,
          };
        }
      }
    } catch {
      // 認証エラーは無視（未ログインでもニュースは表示）
    }

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

    // ユーザー設定に基づいてフィルタリング
    if (userSettings) {
      // ブロックカテゴリに含まれる記事を除外
      if (userSettings.blockedCategories.length > 0) {
        const _blockedNewsCategories = userSettings.blockedCategories.flatMap(
          (cat) => CATEGORY_MAPPING[cat] || []
        );

        articles = articles.filter((_article) => {
          // 記事のカテゴリがブロックリストに含まれていないか確認
          // News APIからのカテゴリ情報がない場合はフィルタリングしない
          return true; // News APIはカテゴリ情報を記事に含まないため、現時点ではフィルタリング困難
        });
      }

      // 18+コンテンツが無効の場合、ゴシップ系を除外
      if (!userSettings.adultContentEnabled) {
        // キーワードベースのフィルタリング
        const adultKeywords = [
          "scandal",
          "affair",
          "nude",
          "sex",
          "porn",
          "xxx",
        ];
        articles = articles.filter((article) => {
          const title = (article.title || "").toLowerCase();
          const description = (article.description || "").toLowerCase();
          return !adultKeywords.some(
            (keyword) =>
              title.includes(keyword) || description.includes(keyword)
          );
        });
      }
    }

    // お気に入りカテゴリの記事を優先表示（ソート）
    if (userSettings?.preferredCategories.length) {
      // 将来的にはスコアリングベースでソート
      // 現時点ではNews APIの制限により実装困難
    }

    return NextResponse.json({
      articles,
      total: articles.length,
      page,
      pageSize,
      userSettings: userSettings
        ? {
            preferredCategories: userSettings.preferredCategories,
            blockedCategories: userSettings.blockedCategories,
          }
        : null,
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
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch news articles" },
      { status: 500 }
    );
  }
}
