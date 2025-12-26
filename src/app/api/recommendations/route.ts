import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractAdvancedWords,
  getAllAdvancedWords,
  type WordDifficultyInfo,
} from "@/lib/word-difficulty";
import { fetchTopHeadlines } from "@/lib/news-api";

// GET: 日次おすすめ単語を取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
  const language = searchParams.get("language") || "english";
  const minLevel = searchParams.get("minLevel") || "C1"; // C1以上をデフォルトに
  const maxLevel = searchParams.get("maxLevel") || "C2";

  try {
    // 今日の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 既存の日次レコメンドをチェック
    const existingRecommendations = await prisma.dailyWordRecommendation.findMany({
      where: {
        date: {
          gte: today,
        },
        isAdded: false,
        isSkipped: false,
      },
      take: limit,
    });

    if (existingRecommendations.length >= limit) {
      return NextResponse.json({
        recommendations: existingRecommendations,
        source: "cached",
      });
    }

    // ユーザーの既知語彙を取得
    const userWords = await prisma.vocabularyWord.findMany({
      where: { language },
      select: { word: true },
    });
    const knownWords = new Set(userWords.map((w) => w.word.toLowerCase()));

    // ニュース記事から単語を抽出
    let advancedWords: WordDifficultyInfo[] = [];

    try {
      const articles = await fetchTopHeadlines({
        category: "general",
        language: "en",
        pageSize: 20,
      });

      // 記事からテキストを抽出
      const allText = articles
        .map((a) => `${a.title} ${a.description} ${a.content}`)
        .join(" ");

      // 高度な単語を抽出
      advancedWords = extractAdvancedWords(allText, knownWords);
    } catch (error) {
      console.error("Failed to fetch news for recommendations:", error);
      // フォールバック: 静的な単語リストから選択
      const allAdvanced = getAllAdvancedWords();
      const unknownAdvanced = allAdvanced.filter((w) => !knownWords.has(w));
      
      // ランダムに選択
      const shuffled = unknownAdvanced.sort(() => Math.random() - 0.5);
      advancedWords = shuffled.slice(0, limit * 2).map((word) => ({
        word,
        cefrLevel: "B2" as const,
        frequencyRank: 5000,
        isAcademic: false,
      }));
    }

    // レベルでフィルター
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const minIndex = levelOrder.indexOf(minLevel);
    const maxIndex = levelOrder.indexOf(maxLevel);

    const filteredWords = advancedWords.filter((w) => {
      const levelIndex = levelOrder.indexOf(w.cefrLevel);
      return levelIndex >= minIndex && levelIndex <= maxIndex;
    });

    // 上位N語を選択
    const topWords = filteredWords.slice(0, limit);

    // 辞書APIで定義を取得し、DBに保存
    const recommendations = await Promise.all(
      topWords.map(async (wordInfo) => {
        // Free Dictionary APIで定義を取得
        let definition = "";
        let pronunciation = "";
        let partOfSpeech = "";

        try {
          const dictResponse = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${wordInfo.word}`
          );
          if (dictResponse.ok) {
            const dictData = await dictResponse.json();
            const entry = dictData[0];
            const meaning = entry.meanings?.[0];
            definition = meaning?.definitions?.[0]?.definition || "";
            pronunciation = entry.phonetic || "";
            partOfSpeech = meaning?.partOfSpeech || "";
          }
        } catch (e) {
          // 辞書APIエラーは無視
        }

        // DBに保存
        const saved = await prisma.dailyWordRecommendation.create({
          data: {
            date: today,
            word: wordInfo.word,
            definition,
            pronunciation,
            partOfSpeech,
            cefrLevel: wordInfo.cefrLevel,
            frequencyRank: wordInfo.frequencyRank,
            sentence: "", // TODO: 記事から例文を抽出
          },
        });

        return saved;
      })
    );

    return NextResponse.json({
      recommendations,
      source: "generated",
      totalAdvancedWords: advancedWords.length,
    });
  } catch (error) {
    console.error("Failed to get recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

// POST: レコメンド単語を単語帳に追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, addToVocabulary = true } = body;

    if (!recommendationId) {
      return NextResponse.json(
        { error: "recommendationId is required" },
        { status: 400 }
      );
    }

    // レコメンドを取得
    const recommendation = await prisma.dailyWordRecommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    if (addToVocabulary) {
      // 単語帳に追加
      await prisma.vocabularyWord.create({
        data: {
          word: recommendation.word,
          pronunciation: recommendation.pronunciation,
          category: recommendation.partOfSpeech || "Other",
          meaning: recommendation.definition,
          example: recommendation.sentence,
          note: `[Daily Recommendation] CEFR ${recommendation.cefrLevel}`,
          language: "english",
        },
      });

      // レコメンドを追加済みにマーク
      await prisma.dailyWordRecommendation.update({
        where: { id: recommendationId },
        data: { isAdded: true },
      });

      return NextResponse.json({
        success: true,
        action: "added",
        word: recommendation.word,
      });
    }

    // スキップ
    await prisma.dailyWordRecommendation.update({
      where: { id: recommendationId },
      data: { isSkipped: true },
    });

    return NextResponse.json({
      success: true,
      action: "skipped",
      word: recommendation.word,
    });
  } catch (error) {
    console.error("Failed to process recommendation:", error);
    return NextResponse.json(
      { error: "Failed to process recommendation" },
      { status: 500 }
    );
  }
}

