"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LanguageHeaderProps {
  flag: string;
  label: string;
  navigation?: ReactNode;
  actions?: ReactNode;
}

export function LanguageHeader({
  flag,
  label,
  navigation,
  actions,
}: LanguageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 戻るボタン & タイトル */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              title="ダッシュボードに戻る"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{flag}</span>
              <h1 className="text-lg font-semibold text-foreground">
                Vocabulary Book ({label})
              </h1>
            </div>
          </div>

          {/* ナビゲーション */}
          {navigation}

          {/* アクション */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}
