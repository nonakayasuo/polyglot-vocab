import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeTextDifficulty } from "@/lib/word-difficulty";
import { fetchTopHeadlines } from "@/lib/news-api";
import type { Article } from "@/types/news";

// GET: おすすめ記事を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "english";
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
  const minDifficulty = Number.parseInt(
    searchParams.get("minDifficulty") || "0",
    10
  );
  const maxDifficulty = Number.parseInt(
    searchParams.get("maxDifficulty") || "100",
    10
  );

  try {
    // ユーザーの既知語彙を取得
    const userWords = await prisma.vocabularyWord.findMany({
      where: { language },
      select: { word: true },
    });
    const knownWords = new Set(userWords.map((w) => w.word.toLowerCase()));

    // 読書履歴を取得（既読記事を除外するため）
    const readArticles = await prisma.readingHistory.findMany({
      select: { articleId: true },
    });
    const readArticleIds = new Set(readArticles.map((r) => r.articleId));

    // ニュース記事を取得
    let articles: Article[] = [];
    try {
      articles = await fetchTopHeadlines({
        category: "general",
        language: "en",
        pageSize: 50,
      });
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return NextResponse.json({
        recommendations: [],
        error: "Failed to fetch news",
      });
    }

    // 記事を分析し、難易度でフィルタリング
    const analyzedArticles = articles
      .map((article) => {
        const text = `${article.title} ${article.description || ""} ${
          article.content || ""
        }`;
        const analysis = analyzeTextDifficulty(text, knownWords);
        return {
          article,
          analysis,
        };
      })
      .filter((item) => {
        // 難易度でフィルタリング
        return (
          item.analysis.difficultyScore >= minDifficulty &&
          item.analysis.difficultyScore <= maxDifficulty
        );
      })
      .sort((a, b) => {
        // 未知語が多い記事を優先（学習効果が高い）
        return (
          b.analysis.advancedWords.length - a.analysis.advancedWords.length
        );
      })
      .slice(0, limit);

    return NextResponse.json({
      recommendations: analyzedArticles.map((item) => ({
        article: {
          title: item.article.title,
          description: item.article.description,
          url: item.article.url,
          imageUrl: item.article.imageUrl,
          source: item.article.source,
          publishedAt: item.article.publishedAt,
        },
        analysis: {
          difficultyScore: item.analysis.difficultyScore,
          level: item.analysis.level,
          totalWords: item.analysis.totalWords,
          advancedWordsCount: item.analysis.advancedWords.length,
          topAdvancedWords: item.analysis.advancedWords
            .slice(0, 5)
            .map((w) => w.word),
        },
      })),
      userKnownWordsCount: knownWords.size,
    });
  } catch (error) {
    console.error("Failed to get recommended articles:", error);
    return NextResponse.json(
      { error: "Failed to get recommended articles" },
      { status: 500 }
    );
  }
}
