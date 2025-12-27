"use client";

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import FlashCard from "@/components/FlashCard";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { VocabularyWord } from "@/types/vocabulary";

export default function FlashcardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchWords = useCallback(async () => {
    try {
      const response = await fetch("/api/words");
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      }
    } catch (error) {
      console.error("Failed to fetch words:", error);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/signin");
          return;
        }

        await fetchWords();
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, fetchWords]);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setIsCompleted(false);
    fetchWords();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 単語がない場合
  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              フラッシュカード
            </h1>
          </div>

          {/* 空状態 */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              単語帳が空です
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              ニュース記事を読みながら、気になる単語を単語帳に追加してください。
              追加した単語はここでフラッシュカード形式で学習できます。
            </p>
            <Link href="/news">
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                ニュースを読む
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 完了状態
  if (isCompleted) {
    const masteredCount = words.filter((w) => w.check1).length;
    const masteredPercentage = Math.round((masteredCount / words.length) * 100);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ホーム
              </Button>
            </Link>
          </div>

          {/* 完了メッセージ */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 学習完了！
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
              お疲れ様でした！継続は力なりです。
            </p>

            {/* 統計 */}
            <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-md">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {words.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  総単語数
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-green-600">
                  {masteredCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  習得済み
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700">
                <p className="text-2xl font-bold text-blue-600">
                  {masteredPercentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  習得率
                </p>
              </div>
            </div>

            {/* アクション */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleRestart}>
                もう一度
              </Button>
              <Link href="/">
                <Button>ホームに戻る</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // フラッシュカード表示
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              フラッシュカード
            </h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {words.length} 単語
          </div>
        </div>

        {/* フラッシュカード */}
        <FlashCard
          words={words}
          onComplete={handleComplete}
          onRefresh={fetchWords}
        />
      </div>
    </div>
  );
}

