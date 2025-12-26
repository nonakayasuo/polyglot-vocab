"use client";

import { BookOpen, CheckCircle, Languages, Tag } from "lucide-react";
import { LANGUAGES, type VocabularyStats } from "@/types/vocabulary";

interface Props {
  stats: VocabularyStats;
}

export default function Statistics({ stats }: Props) {
  const masteredPercent =
    stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
  const notStartedPercent =
    stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0;

  const topCategories = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="text-muted-foreground text-sm">総単語数</span>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-muted-foreground text-sm">✓ 習得済み</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {stats.mastered}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {masteredPercent}%
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-secondary rounded-lg">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground text-sm">□ 未習得</span>
          </div>
          <p className="text-3xl font-bold text-muted-foreground">
            {stats.notStarted}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {notStartedPercent}%
          </p>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="bg-card border rounded-2xl p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          学習進捗
        </h3>
        <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
          {stats.mastered > 0 && (
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${masteredPercent}%` }}
            />
          )}
          {stats.notStarted > 0 && (
            <div
              className="h-full bg-muted transition-all"
              style={{ width: `${notStartedPercent}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">習得済み</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-muted-foreground">未習得</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 言語別統計 */}
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground">
              言語別
            </h3>
          </div>
          <div className="space-y-3">
            {LANGUAGES.map((lang) => {
              const count = stats.byLanguage[lang.value] || 0;
              const percent =
                stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={lang.value}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm flex items-center gap-2">
                      <span>{lang.flag}</span>
                      {lang.label}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* カテゴリ別統計 */}
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-medium text-muted-foreground">
              品詞別（Top 5）
            </h3>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => {
              const percent =
                stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{category}</span>
                    <span className="text-muted-foreground text-sm">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500/70 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <p className="text-muted-foreground text-sm">データなし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
