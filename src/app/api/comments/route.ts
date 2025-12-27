import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 記事のコメント一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 },
      );
    }

    // トップレベルコメントを取得（返信を含む）
    const comments = await prisma.articleComment.findMany({
      where: {
        articleId,
        parentId: null, // トップレベルのみ
      },
      include: {
        replies: {
          include: {
            replies: true, // ネストされた返信も含む
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // ユーザー情報を取得
    const userIds = new Set<string>();

    // 再帰的にユーザーIDを収集
    interface CommentWithReplies {
      userId: string;
      replies?: CommentWithReplies[];
    }

    const collectUserIds = (commentList: CommentWithReplies[]) => {
      for (const comment of commentList) {
        userIds.add(comment.userId);
        if (comment.replies && comment.replies.length > 0) {
          collectUserIds(comment.replies);
        }
      }
    };
    collectUserIds(comments);

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, image: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // コメントにユーザー情報を追加
    // biome-ignore lint/suspicious/noExplicitAny: 深いネストの型推論が複雑なため
    const enrichComment = (comment: any): any => ({
      ...comment,
      user: userMap.get(comment.userId) || { name: "Unknown", image: null },
      replies: comment.replies?.map(enrichComment) || [],
    });

    const enrichedComments = comments.map(enrichComment);

    // 総コメント数
    const totalCount = await prisma.articleComment.count({
      where: { articleId },
    });

    return NextResponse.json({
      comments: enrichedComments,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// 新しいコメントを投稿
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { articleId, content, parentId } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { error: "articleId and content are required" },
        { status: 400 },
      );
    }

    // コンテンツのバリデーション
    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be between 1 and 2000 characters" },
        { status: 400 },
      );
    }

    // 親コメントの存在確認
    if (parentId) {
      const parentComment = await prisma.articleComment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 },
        );
      }
    }

    const comment = await prisma.articleComment.create({
      data: {
        articleId,
        userId: session.user.id,
        content,
        parentId: parentId || null,
      },
    });

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, image: true },
    });

    // 返信の場合、親コメントの作者に通知
    if (parentId) {
      const parentComment = await prisma.articleComment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });

      if (parentComment && parentComment.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: "comment_reply",
            title: "コメントに返信がありました",
            body: `${
              user?.name || "ユーザー"
            }さんがあなたのコメントに返信しました`,
            data: JSON.stringify({
              articleId,
              commentId: comment.id,
              parentId,
            }),
          },
        });
      }
    }

    // アクティビティフィードに追加
    await prisma.activityFeed.create({
      data: {
        userId: session.user.id,
        activityType: "comment_posted",
        title: parentId ? "コメントに返信しました" : "記事にコメントしました",
        description: content.substring(0, 100),
        metadata: JSON.stringify({ articleId, commentId: comment.id }),
      },
    });

    return NextResponse.json({
      ...comment,
      user,
      replies: [],
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// コメントを削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // 本人のコメントのみ削除可能
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.articleComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
