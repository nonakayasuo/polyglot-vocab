import { type NextRequest, NextResponse } from "next/server";

// 記事URLから本文を抽出するAPI
// Readability風のシンプルな抽出を実装

interface ExtractedContent {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  siteName?: string;
  error?: string;
}

// HTMLからメインコンテンツを抽出
function extractMainContent(html: string): ExtractedContent {
  // タイトル抽出
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // OGタイトル（より正確な場合がある）
  const ogTitleMatch = html.match(
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
  );
  const ogTitle = ogTitleMatch ? ogTitleMatch[1] : title;

  // サイト名
  const siteNameMatch = html.match(
    /<meta[^>]+property="og:site_name"[^>]+content="([^"]+)"/i,
  );
  const siteName = siteNameMatch ? siteNameMatch[1] : undefined;

  // 説明文
  const descMatch = html.match(
    /<meta[^>]+name="description"[^>]+content="([^"]+)"/i,
  );
  const excerpt = descMatch ? descMatch[1] : "";

  // スクリプト・スタイル・ナビゲーションを除去
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // article タグの内容を優先
  const articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let mainContent = articleMatch ? articleMatch[1] : "";

  // article がない場合は main タグを試す
  if (!mainContent) {
    const mainMatch = cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    mainContent = mainMatch ? mainMatch[1] : "";
  }

  // それでもない場合は、段落を収集
  if (!mainContent) {
    const paragraphs = cleanHtml.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    // 長い段落のみを抽出（広告やナビゲーションを除外）
    mainContent = paragraphs
      .filter((p) => {
        const text = p.replace(/<[^>]+>/g, "").trim();
        return text.length > 50; // 50文字以上の段落のみ
      })
      .join("\n");
  }

  // HTMLタグを除去してプレーンテキストに
  const textContent = mainContent
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    title: ogTitle || title,
    content: mainContent,
    textContent,
    excerpt,
    siteName,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleUrl = searchParams.get("url");

  if (!articleUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // 記事ページをフェッチ
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch article: ${response.status}` },
        { status: response.status },
      );
    }

    const html = await response.text();
    const extracted = extractMainContent(html);

    // コンテンツが少なすぎる場合はエラー
    if (extracted.textContent.length < 100) {
      return NextResponse.json(
        {
          error: "Could not extract article content",
          excerpt: extracted.excerpt,
          title: extracted.title,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      title: extracted.title,
      content: extracted.textContent,
      excerpt: extracted.excerpt,
      siteName: extracted.siteName,
      wordCount: extracted.textContent.split(/\s+/).length,
    });
  } catch (error) {
    console.error("Failed to extract article content:", error);
    return NextResponse.json(
      { error: "Failed to extract article content" },
      { status: 500 },
    );
  }
}
