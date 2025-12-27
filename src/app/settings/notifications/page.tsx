"use client";

import {
  Bell,
  BellOff,
  BookOpen,
  Flame,
  Loader2,
  Mail,
  MessageSquare,
  Newspaper,
  Save,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface NotificationSettings {
  // メール通知
  emailEnabled: boolean;
  emailDigest: "none" | "daily" | "weekly";
  // プッシュ通知
  pushEnabled: boolean;
  // 通知タイプ別設定
  newArticles: boolean;
  learningReminders: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  weeklyProgress: boolean;
  flashcardReview: boolean;
  // 静音時間
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  emailDigest: "weekly",
  pushEnabled: true,
  newArticles: true,
  learningReminders: true,
  streakReminders: true,
  achievementAlerts: true,
  weeklyProgress: true,
  flashcardReview: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/signin");
          return;
        }

        // APIから通知設定を取得
        const res = await fetch("/api/user/notification-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage({ type: "success", text: "設定を保存しました" });
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({ type: "error", text: "保存に失敗しました" });
    } finally {
      setSaving(false);
    }
  };

  const toggleAll = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      emailEnabled: enabled,
      pushEnabled: enabled,
      newArticles: enabled,
      learningReminders: enabled,
      streakReminders: enabled,
      achievementAlerts: enabled,
      weeklyProgress: enabled,
      flashcardReview: enabled,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {/* 通知のオン/オフ */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                通知設定
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAll(true)}
              >
                <Bell className="w-4 h-4 mr-1" />
                すべてオン
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAll(false)}
              >
                <BellOff className="w-4 h-4 mr-1" />
                すべてオフ
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            受け取りたい通知をカスタマイズできます。
          </p>

          {/* メール通知 */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4" />
              メール通知
            </div>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  メール通知を有効にする
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  重要な更新情報をメールで受け取ります
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailEnabled: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {settings.emailEnabled && (
              <div className="pl-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ダイジェストメールの頻度
                </p>
                <div className="flex gap-2">
                  {[
                    { value: "none", label: "なし" },
                    { value: "daily", label: "毎日" },
                    { value: "weekly", label: "毎週" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          emailDigest: option.value as
                            | "none"
                            | "daily"
                            | "weekly",
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        settings.emailDigest === option.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* プッシュ通知 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MessageSquare className="w-4 h-4" />
              プッシュ通知
            </div>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  プッシュ通知を有効にする
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ブラウザでリアルタイム通知を受け取ります
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    pushEnabled: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* 通知タイプ別設定 */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            通知タイプ
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <Newspaper className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    新着記事
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    あなたのレベルに合った新着記事のお知らせ
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.newArticles}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    newArticles: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    学習リマインダー
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    毎日の学習を習慣化するリマインダー
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.learningReminders}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    learningReminders: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    連続学習リマインダー
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    連続学習記録が途切れそうな時にお知らせ
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.streakReminders}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    streakReminders: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    実績達成アラート
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    バッジやレベルアップを達成した時に通知
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.achievementAlerts}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    achievementAlerts: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    週間学習レポート
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1週間の学習進捗サマリーを受け取る
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyProgress}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    weeklyProgress: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    フラッシュカード復習
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    復習が必要な単語があるときにお知らせ
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.flashcardReview}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    flashcardReview: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* 静音時間 */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BellOff className="w-6 h-6 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              静音時間
            </h2>
          </div>

          <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition mb-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                静音時間を有効にする
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                指定した時間帯は通知を受け取りません
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.quietHoursEnabled}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  quietHoursEnabled: e.target.checked,
                }))
              }
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {settings.quietHoursEnabled && (
            <div className="flex items-center gap-4 pl-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  開始時刻
                </label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      quietHoursStart: e.target.value,
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400 mt-6">〜</span>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  終了時刻
                </label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      quietHoursEnd: e.target.value,
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* メッセージ */}
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            設定を保存
          </Button>
        </div>
      </form>
    </div>
  );
}
