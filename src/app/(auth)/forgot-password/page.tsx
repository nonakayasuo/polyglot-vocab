"use client";

import { authClient } from "@/lib/auth-client";
import { ArrowLeft, CheckCircle, Loader2, Mail, Newspaper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        // ユーザーが存在しない場合でもセキュリティのため成功として表示
        console.error("Password reset error:", resetError);
      }

      // セキュリティのため、常に成功として表示
      setIsSubmitted(true);
    } catch {
      setError("送信中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">
          メールを送信しました
        </h2>

        <p className="text-slate-300 mb-6">
          <span className="font-medium text-emerald-400">{email}</span>
          <br />
          にパスワードリセット用のリンクを送信しました。
          <br />
          メールをご確認ください。
        </p>

        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ログインに戻る
        </Link>
      </div>
    );
  }

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
        パスワードをリセット
      </h2>
      <p className="text-slate-400 text-center text-sm mb-6">
        登録済みのメールアドレスを入力してください。
        <br />
        パスワードリセット用のリンクをお送りします。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            メールアドレス
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
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
              <Mail className="w-5 h-5" />
              リセットリンクを送信
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
