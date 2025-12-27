import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // メール/パスワード認証を有効化
  emailAndPassword: {
    enabled: true,
    // パスワードの最小文字数
    minPasswordLength: 8,
    // メール確認を後で有効化（Phase 1では無効）
    requireEmailVerification: false,
    // パスワードリセットメール送信
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },

  // メール確認設定
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: false, // 現時点では無効
  },

  // セッション設定
  session: {
    // セッションの有効期限（7日間）
    expiresIn: 60 * 60 * 24 * 7,
    // セッション更新の閾値（1日前）
    updateAge: 60 * 60 * 24,
    // Cookie設定
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5分間キャッシュ
    },
  },

  // ユーザー設定
  user: {
    // 追加のユーザーフィールド
    additionalFields: {
      // CEFRレベル
      cefrLevel: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      // 学習言語
      learningLanguage: {
        type: "string",
        required: false,
        defaultValue: "english",
      },
      // ネイティブ言語
      nativeLanguage: {
        type: "string",
        required: false,
        defaultValue: "japanese",
      },
    },
  },

  // ソーシャルプロバイダー
  socialProviders: {
    // Google OAuth（環境変数が設定されている場合のみ有効）
    ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }),
    // Facebook OAuth（環境変数が設定されている場合のみ有効）
    ...(process.env.FACEBOOK_CLIENT_ID &&
      process.env.FACEBOOK_CLIENT_SECRET && {
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        },
      }),
    // Apple Sign In（環境変数が設定されている場合のみ有効）
    ...(process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_CLIENT_SECRET && {
        apple: {
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
        },
      }),
  },

  // プラグイン
  plugins: [
    nextCookies(), // Server Actionsでのcookie処理
    bearer(), // モバイルアプリ用のBearer token認証
  ],

  // 信頼するオリジン（Flutter開発環境を追加）
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:8080", // Flutter Web開発環境
  ],
});

// 型エクスポート
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
