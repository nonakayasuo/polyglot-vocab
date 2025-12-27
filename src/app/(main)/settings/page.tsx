"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Globe,
  Bell,
  Shield,
  Target,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Sparkles,
} from "lucide-react";
import { localeNames, localeFlags, type Locale } from "@/i18n/config";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [currentLocale, setCurrentLocale] = useState<Locale>("ja");
  const [notifications, setNotifications] = useState({
    daily: true,
    weekly: true,
    achievements: true,
  });

  const handleLocaleChange = async (locale: Locale) => {
    setCurrentLocale(locale);
    // Cookieに保存
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    // リロードして言語を反映
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">設定</h1>

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            アカウント
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
            <Link
              href="/settings/profile"
              className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">プロフィール</p>
                <p className="text-sm text-slate-400">名前、メール、アバター</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </section>

        {/* Level Assessment Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            学習
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
            <Link
              href="/assessment"
              className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors border-b border-slate-700/50"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">レベル再診断</p>
                <p className="text-sm text-slate-400">
                  現在のレベル: <span className="text-emerald-400">B1</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                再診断
              </span>
            </Link>

            <div className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">学習履歴</p>
                <p className="text-sm text-slate-400">過去の診断結果を確認</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            言語
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">アプリの言語</p>
                  <p className="text-sm text-slate-400">UIの表示言語を選択</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(localeNames) as Locale[]).map((locale) => (
                  <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                      currentLocale === locale
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-xl">{localeFlags[locale]}</span>
                    <span className="text-white text-sm">
                      {localeNames[locale]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            外観
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden p-4">
            <div className="flex items-center gap-4 mb-4">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-slate-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
              <p className="text-white font-medium">テーマ</p>
            </div>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    theme === t
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <span className="text-white text-sm capitalize">
                    {t === "light"
                      ? "ライト"
                      : t === "dark"
                      ? "ダーク"
                      : "システム"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            通知
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">デイリーリマインダー</p>
                  <p className="text-sm text-slate-400">毎日の学習を促す通知</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((n) => ({ ...n, daily: !n.daily }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.daily ? "bg-emerald-500" : "bg-slate-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.daily ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">達成通知</p>
                  <p className="text-sm text-slate-400">バッジ獲得時に通知</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((n) => ({
                      ...n,
                      achievements: !n.achievements,
                    }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notifications.achievements
                      ? "bg-emerald-500"
                      : "bg-slate-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.achievements
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Logout */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            セキュリティ
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
            <Link
              href="/settings/security"
              className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors border-b border-slate-700/50"
            >
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">セキュリティ設定</p>
                <p className="text-sm text-slate-400">パスワード変更、2FA</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <button className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 transition-colors text-left">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-400 font-medium">ログアウト</p>
              </div>
            </button>
          </div>
        </section>

        {/* App Version */}
        <div className="text-center text-sm text-slate-500">
          <p>NewsLingua v0.1.0</p>
          <p className="mt-1">© 2025 NewsLingua. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
