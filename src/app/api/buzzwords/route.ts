import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// バズワード/スラングのサンプルデータ
// 将来的にはSNS APIやAIサービスから取得
const BUZZWORDS_DATABASE = [
  {
    id: "1",
    word: "slay",
    meaning: "To do something exceptionally well",
    meaningJa: "圧倒的に素晴らしいパフォーマンスをする",
    source: "TIKTOK" as const,
    trendScore: 95,
    category: "compliment",
    examples: [
      "She totally slayed that presentation!",
      "You're slaying in that outfit!",
    ],
    register: "SLANG" as const,
  },
  {
    id: "2",
    word: "no cap",
    meaning: "For real, no lie",
    meaningJa: "マジで、嘘じゃなく",
    source: "TWITTER" as const,
    trendScore: 88,
    category: "emphasis",
    examples: ["That was the best concert ever, no cap.", "No cap, I'm tired."],
    register: "SLANG" as const,
  },
  {
    id: "3",
    word: "rizz",
    meaning: "Charisma, ability to attract others",
    meaningJa: "魅力、人を惹きつける能力",
    source: "TIKTOK" as const,
    trendScore: 90,
    category: "personality",
    examples: ["He's got mad rizz.", "She rizzed him up easily."],
    register: "SLANG" as const,
  },
  {
    id: "4",
    word: "sus",
    meaning: "Suspicious, sketchy",
    meaningJa: "怪しい、疑わしい",
    source: "REDDIT" as const,
    trendScore: 85,
    category: "observation",
    examples: ["That's kinda sus.", "He's acting sus today."],
    register: "SLANG" as const,
  },
  {
    id: "5",
    word: "ate",
    meaning: "Did something perfectly",
    meaningJa: "完璧にやり遂げた",
    source: "TIKTOK" as const,
    trendScore: 79,
    category: "compliment",
    examples: ["She ate and left no crumbs!", "That performance? She ate."],
    register: "SLANG" as const,
  },
  {
    id: "6",
    word: "delulu",
    meaning: "Delusional, often used humorously",
    meaningJa: "妄想的な（ユーモラスに使用）",
    source: "TIKTOK" as const,
    trendScore: 75,
    category: "humor",
    examples: [
      "I'm delulu but I think he likes me.",
      "Stay delulu, it's the solution.",
    ],
    register: "SLANG" as const,
  },
  {
    id: "7",
    word: "bet",
    meaning: "Okay, sounds good, agreement",
    meaningJa: "いいよ、了解",
    source: "TWITTER" as const,
    trendScore: 78,
    category: "agreement",
    examples: ["Bet, I'll see you there.", "Wanna grab food? Bet."],
    register: "SLANG" as const,
  },
  {
    id: "8",
    word: "bussin",
    meaning: "Really good, especially food",
    meaningJa: "めっちゃ美味しい、最高",
    source: "TIKTOK" as const,
    trendScore: 76,
    category: "compliment",
    examples: ["This burger is bussin!", "The new album is bussin fr."],
    register: "SLANG" as const,
  },
  {
    id: "9",
    word: "lowkey",
    meaning: "Somewhat, secretly",
    meaningJa: "ちょっと、密かに",
    source: "TWITTER" as const,
    trendScore: 80,
    category: "modifier",
    examples: ["I lowkey want pizza.", "She's lowkey talented."],
    register: "SLANG" as const,
  },
  {
    id: "10",
    word: "highkey",
    meaning: "Very much, obviously",
    meaningJa: "とても、明らかに",
    source: "TWITTER" as const,
    trendScore: 70,
    category: "modifier",
    examples: ["I highkey love this song.", "That's highkey impressive."],
    register: "SLANG" as const,
  },
  {
    id: "11",
    word: "understood the assignment",
    meaning: "Perfectly met expectations",
    meaningJa: "期待に完璧に応えた",
    source: "TWITTER" as const,
    trendScore: 82,
    category: "compliment",
    examples: [
      "She understood the assignment at the Met Gala.",
      "The marketing team understood the assignment.",
    ],
    register: "SLANG" as const,
  },
  {
    id: "12",
    word: "main character energy",
    meaning: "Acting like the protagonist of a story",
    meaningJa: "物語の主人公のように振る舞う",
    source: "TIKTOK" as const,
    trendScore: 72,
    category: "personality",
    examples: [
      "She's got main character energy.",
      "Today I'm channeling main character energy.",
    ],
    register: "SLANG" as const,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const source = searchParams.get("source") || "all";

    // ユーザーのスラング表示設定を確認
    let showSlang = true;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user?.id) {
        const settings = await prisma.userContentSettings.findUnique({
          where: { userId: session.user.id },
        });
        if (settings) {
          showSlang = settings.showSlang;
        }
      }
    } catch {
      // 認証エラーは無視
    }

    if (!showSlang) {
      return NextResponse.json({
        buzzwords: [],
        message:
          "スラング表示が無効になっています。設定から有効にしてください。",
      });
    }

    // ソースでフィルタリング
    let filteredBuzzwords = BUZZWORDS_DATABASE;
    if (source !== "all") {
      filteredBuzzwords = BUZZWORDS_DATABASE.filter(
        (bw) => bw.source.toLowerCase() === source.toLowerCase()
      );
    }

    // トレンドスコアでソートして制限
    const sortedBuzzwords = filteredBuzzwords
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);

    return NextResponse.json({
      buzzwords: sortedBuzzwords,
      total: sortedBuzzwords.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch buzzwords:", error);
    return NextResponse.json(
      { error: "Failed to fetch buzzwords" },
      { status: 500 }
    );
  }
}
