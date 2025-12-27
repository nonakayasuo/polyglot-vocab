import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// 便利なフック・関数をエクスポート
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// ソーシャルログイン用のヘルパー
export const signInWithGoogle = () =>
  authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  });

export const signInWithApple = () =>
  authClient.signIn.social({
    provider: "apple",
    callbackURL: "/",
  });
