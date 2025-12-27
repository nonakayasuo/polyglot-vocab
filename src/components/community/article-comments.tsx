"use client";

import {
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Reply,
  Send,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  parentId: string | null;
  likesCount: number;
  createdAt: string;
  user: User;
  replies: Comment[];
}

interface ArticleCommentsProps {
  articleId: string;
  currentUserId?: string;
}

export function ArticleComments({
  articleId,
  currentUserId,
}: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          content: content.trim(),
          parentId: parentId || null,
        }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyContent("");
          setReplyingTo(null);
        } else {
          setNewComment("");
        }
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("コメントを削除しますか？")) return;

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "たった今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP");
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={`${
        depth > 0
          ? "ml-8 border-l-2 border-gray-100 dark:border-slate-700 pl-4"
          : ""
      }`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name || "User"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              {(comment.user.name || "U")[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.user.name || "ユーザー"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-500 h-auto py-1 px-2"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span className="text-xs">{comment.likesCount || 0}</span>
              </Button>

              {currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className="text-gray-500 hover:text-blue-500 h-auto py-1 px-2"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  <span className="text-xs">返信</span>
                </Button>
              )}

              {currentUserId === comment.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-500 hover:text-red-500 h-auto py-1 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 h-auto py-1 px-2 ml-auto"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && currentUserId && (
          <div className="mt-4 pl-12">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="返信を入力..."
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(comment.id);
                  }
                }}
              />
              <Button
                onClick={() => handleSubmitComment(comment.id)}
                disabled={!replyContent.trim() || submitting}
                size="sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          ディスカッション
        </h3>
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
          {totalCount}
        </span>
      </div>

      {/* New Comment Form */}
      {currentUserId ? (
        <div className="mb-6">
          <div className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="この記事について議論しましょう..."
              rows={3}
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button
              onClick={() => handleSubmitComment()}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              投稿
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            ディスカッションに参加するには
            <a href="/signin" className="text-blue-500 hover:underline ml-1">
              ログイン
            </a>
            してください
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            まだコメントがありません
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            最初のコメントを投稿しましょう
          </p>
        </div>
      ) : (
        <div className="space-y-4">{comments.map((c) => renderComment(c))}</div>
      )}
    </div>
  );
}
