"use client";

import {
  AlertTriangle,
  Calendar,
  Check,
  Filter,
  Flame,
  Loader2,
  MessageSquare,
  Save,
  Shield,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface ContentSettings {
  adultContentEnabled: boolean;
  ageVerified: boolean;
  dateOfBirth: string | null;
  showSlang: boolean;
  showTaboo: boolean;
  preferredCategories: string[];
  blockedCategories: string[];
}

const CONTENT_CATEGORIES = [
  { id: "news", label: "ニュース", icon: "📰" },
  { id: "entertainment", label: "エンタメ", icon: "🎬" },
  { id: "sports", label: "スポーツ", icon: "⚽" },
  { id: "tech", label: "テクノロジー", icon: "💻" },
  { id: "culture", label: "カルチャー", icon: "🎭" },
  { id: "gossip", label: "ゴシップ", icon: "🌶️" },
  { id: "kpop", label: "K-POP", icon: "🎤" },
  { id: "anime", label: "アニメ・マンガ", icon: "🎌" },
  { id: "gaming", label: "ゲーム", icon: "🎮" },
];

export default function ContentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<ContentSettings>({
    adultContentEnabled: false,
    ageVerified: false,
    dateOfBirth: null,
    showSlang: true,
    showTaboo: false,
    preferredCategories: ["news", "entertainment"],
    blockedCategories: [],
  });

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/signin");
          return;
        }

        // APIからコンテンツ設定を取得
        const res = await fetch("/api/user/content-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          if (data.dateOfBirth) {
            setDateOfBirth(data.dateOfBirth.split("T")[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [router]);

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleAgeVerification = () => {
    if (!dateOfBirth) {
      setMessage({ type: "error", text: "生年月日を入力してください" });
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age >= 18) {
      setSettings((prev) => ({
        ...prev,
        ageVerified: true,
        dateOfBirth: dateOfBirth,
      }));
      setShowAgeVerification(false);
      setMessage({ type: "success", text: "年齢確認が完了しました" });
    } else {
      setMessage({
        type: "error",
        text: "18歳未満の方はこの機能を利用できません",
      });
    }
  };

  const toggleCategory = (
    categoryId: string,
    type: "preferred" | "blocked",
  ) => {
    setSettings((prev) => {
      if (type === "preferred") {
        const isPreferred = prev.preferredCategories.includes(categoryId);
        return {
          ...prev,
          preferredCategories: isPreferred
            ? prev.preferredCategories.filter((c) => c !== categoryId)
            : [...prev.preferredCategories, categoryId],
          blockedCategories: prev.blockedCategories.filter(
            (c) => c !== categoryId,
          ),
        };
      } else {
        const isBlocked = prev.blockedCategories.includes(categoryId);
        return {
          ...prev,
          blockedCategories: isBlocked
            ? prev.blockedCategories.filter((c) => c !== categoryId)
            : [...prev.blockedCategories, categoryId],
          preferredCategories: prev.preferredCategories.filter(
            (c) => c !== categoryId,
          ),
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/content-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          dateOfBirth: settings.dateOfBirth || null,
        }),
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
        {/* レジスター設定 */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              言語レジスター設定
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            学習時に表示する語彙のレジスター（フォーマル度）を設定します。
          </p>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    スラング表示
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    カジュアルなスラング・口語表現を表示します
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showSlang}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    showSlang: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition ${
                settings.ageVerified
                  ? "bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700"
                  : "bg-gray-100 dark:bg-slate-700/30 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    タブー表現表示
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    18+の成人向け表現を学習に含めます（年齢確認必須）
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showTaboo}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    showTaboo: e.target.checked,
                  }))
                }
                disabled={!settings.ageVerified}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </label>
          </div>
        </div>

        {/* 18+コンテンツ設定 */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              18+コンテンツ設定
            </h2>
          </div>

          {!settings.ageVerified ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-300">
                    年齢確認が必要です
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                    18+コンテンツ（ゴシップ、成人向け表現等）を利用するには、
                    年齢確認が必要です。
                  </p>
                </div>
              </div>

              {!showAgeVerification ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAgeVerification(true)}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  年齢確認を行う
                </Button>
              ) : (
                <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div className="space-y-2">
                    <Label htmlFor="dob">生年月日</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAgeVerification}>
                      <Check className="w-4 h-4 mr-2" />
                      確認
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAgeVerification(false)}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">年齢確認済み</span>
              </div>

              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      18+コンテンツを有効化
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ゴシップ、スキャンダル、成人向け表現を含むコンテンツを表示
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.adultContentEnabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      adultContentEnabled: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* カテゴリ設定 */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              コンテンツカテゴリ
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            興味のあるカテゴリを選択してください。ブロックしたカテゴリは表示されません。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTENT_CATEGORIES.map((category) => {
              const isPreferred = settings.preferredCategories.includes(
                category.id,
              );
              const isBlocked = settings.blockedCategories.includes(
                category.id,
              );

              // gossipは18+コンテンツが無効の場合は非表示
              if (category.id === "gossip" && !settings.adultContentEnabled) {
                return null;
              }

              return (
                <div
                  key={category.id}
                  className={`p-4 rounded-xl border-2 transition ${
                    isPreferred
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : isBlocked
                        ? "border-red-300 bg-red-50 dark:bg-red-900/20 opacity-60"
                        : "border-gray-200 dark:border-slate-600 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id, "preferred")}
                        className={`p-1.5 rounded-lg transition ${
                          isPreferred
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-200"
                        }`}
                        title="お気に入り"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id, "blocked")}
                        className={`p-1.5 rounded-lg transition ${
                          isBlocked
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-200"
                        }`}
                        title="ブロック"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </p>
                </div>
              );
            })}
          </div>
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
