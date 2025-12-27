"use client";

import {
  ArrowLeft,
  ExternalLink,
  Filter,
  Loader2,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    News Reader
                  </h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">
                    英語ニュースで学習
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              更新
            </button>
          </div>
        </div>
      </header>

      {/* フィルターセクション */}
      <div className="sticky top-16 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* 検索 */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              
              {/* カテゴリ */}
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as NewsCategory)}
                disabled={!!debouncedQuery}
              >
                <SelectTrigger className="w-[140px] bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl">
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
                <SelectTrigger className="w-[160px] bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl">
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
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ローディング */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">ニュースを取得中...</span>
            </div>
          </div>
        )}

        {/* エラー */}
        {error && !loading && (
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
            <p className="text-red-500/70 dark:text-red-400/70 text-sm">
              NEWS_API_KEY を .env ファイルに設定してください。
              <br />
              <a
                href="https://newsapi.org/register"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-600"
              >
                News API に登録する →
              </a>
            </p>
          </div>
        )}

        {/* 記事がない場合 */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <Newspaper className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              記事が見つかりませんでした
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              別のキーワードやカテゴリで検索してみてください
            </p>
          </div>
        )}

        {/* 記事一覧 */}
        {!loading && !error && articles.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {articles.length} 件の記事
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// 記事カードコンポーネント
function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <article 
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 画像 */}
      <div className="relative h-48 overflow-hidden">
        {article.imageUrl ? (
          <>
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
            <Newspaper className="w-16 h-16 text-blue-200 dark:text-blue-800" />
          </div>
        )}
        
        {/* ソースバッジ */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium bg-white/90 dark:bg-slate-900/90 backdrop-blur text-blue-600 dark:text-blue-400 rounded-full shadow-lg">
            {article.source}
          </span>
        </div>

        {/* 難易度バッジ（あれば） */}
        {article.difficulty && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium bg-amber-500/90 text-white rounded-full shadow-lg">
              {article.difficulty}
            </span>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        {/* 日付 */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        {/* タイトル */}
        <h2 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h2>

        {/* 説明 */}
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
          {article.description}
        </p>

        {/* アクション */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <Link
            href={`/news/${article.id}`}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group/link"
          >
            <Sparkles className="w-4 h-4" />
            記事を読む
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
            title="元記事を開く"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ホバーエフェクト */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </article>
  );
}
