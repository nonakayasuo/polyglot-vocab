"use client";

import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Newspaper,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // エラーがある場合（無効なトークン等）
  if (error === "INVALID_TOKEN" || !token) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">
          リンクが無効です
        </h2>

        <p className="text-slate-300 mb-6">
          パスワードリセットリンクが無効か、有効期限が切れています。
          <br />
          もう一度パスワードリセットをお試しください。
        </p>

        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all"
        >
          パスワードリセットを再試行
        </Link>
      </div>
    );
  }

  // パスワードリセット成功
  if (isSuccess) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">
          パスワードを変更しました
        </h2>

        <p className="text-slate-300 mb-6">
          新しいパスワードでログインできるようになりました。
        </p>

        <Link
          href="/signin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all"
        >
          ログインする
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // バリデーション
    if (password.length < 8) {
      setFormError("パスワードは8文字以上で入力してください");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setFormError(error.message || "パスワードのリセットに失敗しました");
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
          <Newspaper className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">NewsLingua</h1>
          <p className="text-xs text-slate-400">ニュースで学ぶ語学</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white text-center mb-2">
        新しいパスワードを設定
      </h2>
      <p className="text-slate-400 text-center text-sm mb-6">
        8文字以上の安全なパスワードを入力してください
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            新しいパスワード
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              required
              minLength={8}
              className="w-full pl-11 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            パスワード（確認）
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
              required
              minLength={8}
              className="w-full pl-11 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {formError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Key className="w-5 h-5" />
              パスワードを変更
            </>
          )}
        </button>
      </form>

      {/* Back to Sign In */}
      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ログインに戻る
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
