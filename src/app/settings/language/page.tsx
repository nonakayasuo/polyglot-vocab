"use client";

import {
  BookOpen,
  Check,
  Globe,
  Languages,
  Loader2,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface LanguageSettings {
  learningLanguage: string;
  nativeLanguage: string;
  uiLanguage: string;
}

const LEARNING_LANGUAGES = [
  { code: "english", name: "English", nameJa: "英語", flag: "🇬🇧" },
  { code: "spanish", name: "Español", nameJa: "スペイン語", flag: "🇪🇸" },
  { code: "korean", name: "한국어", nameJa: "韓国語", flag: "🇰🇷" },
  { code: "chinese", name: "中文", nameJa: "中国語", flag: "🇨🇳" },
  { code: "french", name: "Français", nameJa: "フランス語", flag: "🇫🇷" },
  { code: "german", name: "Deutsch", nameJa: "ドイツ語", flag: "🇩🇪" },
];

const NATIVE_LANGUAGES = [
  { code: "japanese", name: "日本語", flag: "🇯🇵" },
  { code: "english", name: "English", flag: "🇬🇧" },
  { code: "korean", name: "한국어", flag: "🇰🇷" },
  { code: "chinese", name: "中文", flag: "🇨🇳" },
];

const UI_LANGUAGES = [
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<LanguageSettings>({
    learningLanguage: "english",
    nativeLanguage: "japanese",
    uiLanguage: "ja",
  });
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

        // ユーザー設定を取得
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            learningLanguage: data.learningLanguage || "english",
            nativeLanguage: data.nativeLanguage || "japanese",
            uiLanguage: data.uiLanguage || "ja",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage({ type: "success", text: "言語設定を保存しました" });
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({ type: "error", text: "設定の保存に失敗しました" });
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
      {/* 学習言語 */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              学習言語
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ニュースで学習したい言語を選択
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LEARNING_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() =>
                setSettings({ ...settings, learningLanguage: lang.code })
              }
              className={`relative p-4 rounded-xl border-2 transition-all ${
                settings.learningLanguage === lang.code
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
              }`}
            >
              {settings.learningLanguage === lang.code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
              )}
              <span className="text-2xl mb-2 block">{lang.flag}</span>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {lang.nameJa}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ネイティブ言語 */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Languages className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              母国語
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              翻訳や説明に使用する言語
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NATIVE_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() =>
                setSettings({ ...settings, nativeLanguage: lang.code })
              }
              className={`relative p-4 rounded-xl border-2 transition-all ${
                settings.nativeLanguage === lang.code
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
              }`}
            >
              {settings.nativeLanguage === lang.code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              )}
              <span className="text-2xl mb-2 block">{lang.flag}</span>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {lang.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* UI言語 */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              表示言語
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              アプリのUIで使用する言語
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {UI_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() =>
                setSettings({ ...settings, uiLanguage: lang.code })
              }
              className={`relative p-4 rounded-xl border-2 transition-all ${
                settings.uiLanguage === lang.code
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
              }`}
            >
              {settings.uiLanguage === lang.code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-purple-500" />
                </div>
              )}
              <span className="text-2xl mb-2 block">{lang.flag}</span>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {lang.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* メッセージ */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
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
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          設定を保存
        </Button>
      </div>
    </div>
  );
}

