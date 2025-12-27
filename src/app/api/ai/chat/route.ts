import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// AIチャットエンドポイント
// Python AIサービス (MCP) と連携
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await request.json();
    const { message, context, articleId, userLevel = "B1" } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Python AIサービスのエンドポイント
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    // メッセージを分析してどのツールを使うか決定
    const toolName = determineToolFromMessage(message);
    const toolArgs = buildToolArguments(toolName, message, {
      context,
      articleId,
      userLevel,
      userId: session?.user?.id,
    });

    try {
      // Python AIサービスにリクエスト
      const response = await fetch(`${aiServiceUrl}/api/v1/${toolName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.user?.id && { "X-User-Id": session.user.id }),
        },
        body: JSON.stringify(toolArgs),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          response: formatAIResponse(toolName, data),
          metadata: { tool: toolName, ...data },
        });
      }

      // AIサービスが利用できない場合はフォールバック
      return NextResponse.json({
        response: generateFallbackResponse(message, userLevel),
        metadata: { fallback: true },
      });
    } catch {
      // AIサービス接続エラー時のフォールバック
      return NextResponse.json({
        response: generateFallbackResponse(message, userLevel),
        metadata: { fallback: true },
      });
    }
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// メッセージからツール名を判定
function determineToolFromMessage(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("学習プラン") ||
    lower.includes("プラン") ||
    lower.includes("learning plan")
  ) {
    return "learning-plan";
  }

  if (
    lower.includes("バズワード") ||
    lower.includes("buzzword") ||
    lower.includes("トレンド")
  ) {
    return "buzzwords";
  }

  if (
    lower.includes("スラング") ||
    lower.includes("slang") ||
    lower.match(/「.+」.*(?:意味|教えて|説明)/)
  ) {
    return "analyze-slang";
  }

  if (
    lower.includes("レジスター") ||
    lower.includes("フォーマル") ||
    lower.includes("カジュアル")
  ) {
    return "analyze-register";
  }

  if (lower.includes("要約") || lower.includes("summary")) {
    return "summarize";
  }

  if (
    lower.includes("単語") ||
    lower.includes("意味") ||
    lower.includes("word")
  ) {
    return "explain-word";
  }

  if (
    lower.includes("文法") ||
    lower.includes("grammar") ||
    lower.includes("構文")
  ) {
    return "explain-grammar";
  }

  if (lower.includes("進捗") || lower.includes("progress")) {
    return "analyze-progress";
  }

  return "chat";
}

// ツール引数を構築
function buildToolArguments(
  toolName: string,
  message: string,
  context: {
    context?: string;
    articleId?: string;
    userLevel?: string;
    userId?: string;
  },
): Record<string, unknown> {
  const baseArgs = {
    user_level: context.userLevel || "B1",
    native_language: "japanese",
  };

  switch (toolName) {
    case "learning-plan":
      return {
        ...baseArgs,
        target_level: "B2",
        interests: ["news", "technology"],
      };

    case "buzzwords":
      return {
        language: "english",
        source: "all",
        count: 5,
      };

    case "analyze-slang": {
      // メッセージから単語を抽出
      const slangMatch = message.match(/[「『"](.+?)[」』"]/);
      return {
        ...baseArgs,
        slang: slangMatch?.[1] || message.split(/\s+/)[0],
        language: "english",
      };
    }

    case "analyze-register": {
      const registerMatch = message.match(/[「『"](.+?)[」』"]/);
      return {
        ...baseArgs,
        expression: registerMatch?.[1] || message,
        language: "english",
      };
    }

    case "summarize":
      return {
        ...baseArgs,
        content: context.context || message,
        language: "english",
      };

    case "explain-word": {
      const wordMatch = message.match(/[「『"](.+?)[」』"]/);
      return {
        ...baseArgs,
        word: wordMatch?.[1] || message.split(/\s+/)[0],
        language: "english",
      };
    }

    case "explain-grammar":
      return {
        ...baseArgs,
        text: context.context || message,
        language: "english",
      };

    default:
      return {
        ...baseArgs,
        message,
        context: context.context,
      };
  }
}

// AIレスポンスをフォーマット
function formatAIResponse(
  toolName: string,
  data: Record<string, unknown>,
): string {
  // 各ツールのレスポンスをユーザーフレンドリーにフォーマット
  if (data.error) {
    return `申し訳ありません、エラーが発生しました: ${data.error}`;
  }

  // ツール別のフォーマット
  switch (toolName) {
    case "buzzwords":
      if (data.buzzwords && Array.isArray(data.buzzwords)) {
        const buzzwords = data.buzzwords as Array<{
          word: string;
          meaning_ja?: string;
          source?: string;
        }>;
        return `🔥 **今日のトレンドワード**\n\n${buzzwords
          .map(
            (bw, i) =>
              `**${i + 1}. "${bw.word}"**\n${bw.meaning_ja || ""}\n📍 ${
                bw.source || "SNS"
              }`,
          )
          .join("\n\n")}`;
      }
      break;

    case "learning-plan":
      if (data.summary) {
        return `📊 **学習プラン**\n\n${data.summary}\n\n${
          data.next_actions
            ? `**次のアクション:**\n${(data.next_actions as string[])
                .map((a) => `• ${a}`)
                .join("\n")}`
            : ""
        }`;
      }
      break;

    default:
      // デフォルトはJSONを整形
      return JSON.stringify(data, null, 2);
  }

  return JSON.stringify(data, null, 2);
}

// フォールバックレスポンス生成
function generateFallbackResponse(message: string, userLevel: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("学習プラン") || lower.includes("プラン")) {
    return `📊 **あなたの学習プラン提案**

現在のレベル: ${userLevel}

**今週の目標:**
• 📚 新しい単語: 30語
• 📰 記事を読む: 5本
• 🎯 クイズ正答率: 80%以上

**おすすめの学習ルーティン:**

🌅 **朝 (15分)** - 今日のバズワードをチェック
🌞 **日中 (20分)** - ニュース記事1本を精読
🌙 **夜 (15分)** - その日学んだ単語の復習

継続は力なり！毎日少しずつ続けましょう 💪`;
  }

  if (lower.includes("バズワード") || lower.includes("スラング")) {
    return `🔥 **今日のトレンドワード**

**1. "slay"** 🗣️
意味: 圧倒的なパフォーマンスをする

**2. "no cap"** 💬
意味: マジで、嘘じゃなく

**3. "rizz"** ✨
意味: 魅力、人を惹きつける力

⚠️ これらはカジュアルな場面で使います`;
  }

  if (lower.includes("コツ") || lower.includes("tips")) {
    return `💡 **効果的な言語学習のコツ**

1. **間隔反復学習** 🔄
2. **コンテキストで学ぶ** 📰
3. **アウトプットを意識** 🗣️
4. **レジスターを意識** 🎭
5. **毎日少しずつ** ⏰`;
  }

  return `ご質問ありがとうございます！

${message}について理解しました。

💡 **ヒント:** 
- 特定の単語について知りたい場合は「〇〇の意味を教えて」と聞いてください
- 記事の要約は「この記事を要約して」で依頼できます

他にも何かお手伝いできることはありますか？`;
}
