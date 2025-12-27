"use client";

import {
  Award,
  BookOpen,
  Flame,
  HelpCircle,
  Menu,
  MessageSquare,
  Newspaper,
  Settings,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  labelJa: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    labelJa: "ホーム",
    icon: Sparkles,
    description: "ダッシュボード・統計",
  },
  {
    href: "/news",
    label: "News",
    labelJa: "ニュース",
    icon: Newspaper,
    description: "英語ニュースを読んで学習",
  },
  {
    href: "/english",
    label: "Vocabulary",
    labelJa: "単語帳",
    icon: BookOpen,
    description: "保存した単語を復習",
  },
  {
    href: "/assessment",
    label: "Assessment",
    labelJa: "レベル診断",
    icon: Trophy,
    description: "CEFRレベルをチェック",
    badge: "NEW",
    badgeColor: "bg-amber-500",
  },
  {
    href: "/assessment/slang",
    label: "Slang Test",
    labelJa: "スラングテスト",
    icon: Flame,
    description: "スラング理解度テスト",
    badge: "NEW",
    badgeColor: "bg-orange-500",
  },
  {
    href: "/settings/content",
    label: "Content",
    labelJa: "コンテンツ設定",
    icon: MessageSquare,
    description: "好みのカテゴリを設定",
  },
  {
    href: "/settings",
    label: "Settings",
    labelJa: "設定",
    icon: Settings,
    description: "アカウント・表示設定",
  },
];

const COMING_SOON_ITEMS: NavItem[] = [
  {
    href: "#",
    label: "Community",
    labelJa: "コミュニティ",
    icon: Users,
    description: "学習グループ・ディスカッション",
    badge: "近日公開",
    badgeColor: "bg-purple-500",
  },
  {
    href: "#",
    label: "Achievements",
    labelJa: "実績",
    icon: Award,
    description: "バッジ・実績を確認",
    badge: "近日公開",
    badgeColor: "bg-purple-500",
  },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // メニューが開いているときはスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ハンバーガーボタン */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
        aria-label="メニューを開く"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* オーバーレイ */}
      {isOpen && (
        <button
          type="button"
          aria-label="メニューを閉じる"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity cursor-pointer border-none"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        />
      )}

      {/* サイドメニュー（右側から表示） */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                NewsLingua
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ニュースで学ぶ語彙
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            aria-label="メニューを閉じる"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-blue-500" : ""}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.labelJa}</span>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Coming Soon セクション */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-2">
              Coming Soon
            </p>
            <div className="space-y-1 opacity-60">
              {COMING_SOON_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.labelJa}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* フッター */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span>ヘルプ・使い方</span>
          </Link>
        </div>
      </div>
    </>
  );
}
