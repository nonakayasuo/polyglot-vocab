import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Newspaper,
  TrendingUp,
  Users,
} from "lucide-react";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [totalUsers, totalWords, totalArticles, recentActivity] =
    await Promise.all([
      prisma.user.count(),
      prisma.vocabularyWord.count(),
      prisma.article.count(),
      prisma.learningActivity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24時間以内
          },
        },
      }),
    ]);

  // 昨日の統計と比較（簡略化）
  const yesterdayUsers = await prisma.user.count({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  const newUsersToday = totalUsers - yesterdayUsers;

  return {
    totalUsers,
    totalWords,
    totalArticles,
    recentActivity,
    newUsersToday,
    growthRate:
      yesterdayUsers > 0
        ? ((newUsersToday / yesterdayUsers) * 100).toFixed(1)
        : "0",
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === "positive" ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : changeType === "negative" ? (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  changeType === "positive"
                    ? "text-green-600"
                    : changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

async function Dashboard() {
  const stats = await getStats();

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-500">
          NewsLingua の運用状況を確認
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="総ユーザー数"
          value={stats.totalUsers}
          icon={Users}
          change={`+${stats.newUsersToday} 今日`}
          changeType={stats.newUsersToday > 0 ? "positive" : "neutral"}
        />
        <StatCard title="登録単語数" value={stats.totalWords} icon={BookOpen} />
        <StatCard title="記事数" value={stats.totalArticles} icon={Newspaper} />
        <StatCard
          title="24時間のアクティビティ"
          value={stats.recentActivity}
          icon={TrendingUp}
        />
      </div>

      {/* 追加のセクション（プレースホルダー） */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 最近のユーザー */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            最近のユーザー
          </h2>
          <p className="text-sm text-gray-500">
            新規登録ユーザーがここに表示されます
          </p>
        </div>

        {/* 人気の記事 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            人気の記事
          </h2>
          <p className="text-sm text-gray-500">
            よく読まれている記事がここに表示されます
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
