"use client";

import { Camera, Loader2, Save, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  cefrLevel?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/signin");
          return;
        }

        const userData = session.data.user as UserProfile;
        setUser(userData);
        setName(userData.name || "");
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setMessage({ type: "success", text: "プロフィールを更新しました" });

      // セッションを再取得
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser(session.data.user as UserProfile);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ type: "error", text: "更新に失敗しました" });
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

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          プロフィール
        </h2>

        {/* アバター */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {user.image ? (
              <Image
                src={user.image}
                alt="ユーザーアバター"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition"
            >
              <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name || "名前未設定"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            {user.cefrLevel && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                CEFRレベル: {user.cefrLevel}
              </p>
            )}
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">表示名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="あなたの名前"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-gray-50 dark:bg-slate-700"
              />
              <p className="text-xs text-gray-500">
                メールアドレスは変更できません
              </p>
            </div>
          </div>

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

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              保存
            </Button>
          </div>
        </form>
      </div>

      {/* 学習統計 */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          学習統計
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          学習統計の詳細はホーム画面で確認できます。
        </p>
      </div>

      {/* アカウント削除 */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          アカウント削除
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          アカウントを削除すると、すべてのデータが完全に削除されます。
          この操作は取り消せません。
        </p>
        <Button variant="destructive" disabled>
          アカウントを削除
        </Button>
      </div>
    </div>
  );
}
