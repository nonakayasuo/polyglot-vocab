"use client";

import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Newspaper,
  RefreshCw,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Article, NewsCategory } from "@/types/news";
import { NEWS_CATEGORIES, NEWS_SOURCES } from "@/types/news";

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<NewsCategory>("general");
  const [source, setSource] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 検索クエリのデバウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      } else {
        params.set("category", category);
      }

      if (source !== "all") {
        params.set("source", source);
      }

      params.set("language", "en");
      params.set("pageSize", "20");

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to fetch news");
      }

      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError(
        err instanceof Error ? err.message : "ニュースの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, [category, source, debouncedQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">
                  News Reader
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchNews}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* フィルター */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* 検索 */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* カテゴリ */}
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as NewsCategory)}
              disabled={!!debouncedQuery}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                {NEWS_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ソース */}
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ソース" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📰 すべてのソース</SelectItem>
                {NEWS_SOURCES.map((src) => (
                  <SelectItem key={src.id} value={src.id}>
                    {src.icon} {src.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ローディング */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* エラー */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-red-500 text-sm mt-2">
              NEWS_API_KEY を .env ファイルに設定してください。
              <br />
              <a
                href="https://newsapi.org/register"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                News API に登録する →
              </a>
            </p>
          </div>
        )}

        {/* 記事一覧 */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>記事が見つかりませんでした</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// 記事カードコンポーネント
function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      {/* 画像 */}
      {article.imageUrl && (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized // 外部画像のため
          />
        </div>
      )}
      {!article.imageUrl && (
        <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Newspaper className="w-12 h-12 text-blue-200" />
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-4">
        {/* ソース・日付 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-medium text-blue-600">{article.source}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</span>
        </div>

        {/* タイトル */}
        <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h2>

        {/* 説明 */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {article.description}
        </p>

        {/* アクション */}
        <div className="flex items-center justify-between">
          <Link
            href={`/news/${article.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            記事を読む →
          </Link>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="元記事を開く"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

