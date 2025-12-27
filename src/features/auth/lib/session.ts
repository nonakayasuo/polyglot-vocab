import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * サーバーコンポーネント・Server Actionでセッションを取得
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * 認証が必要なServer Actionで使用
 * @throws 未認証の場合はエラーをスロー
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * ユーザーIDを取得（認証必須）
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}
