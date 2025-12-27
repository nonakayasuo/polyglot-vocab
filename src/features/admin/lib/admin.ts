import { getServerSession } from "@/features/auth/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * ユーザーが管理者かどうかを確認
 * 環境変数 ADMIN_EMAILS にカンマ区切りで管理者メールアドレスを設定
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    return false;
  }

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];

  return adminEmails.includes(user.email.toLowerCase());
}

/**
 * 現在のセッションユーザーが管理者かどうかを確認
 */
export async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}> {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return { isAdmin: false, userId: null, error: "Unauthorized" };
    }

    const adminStatus = await isAdmin(session.user.id);

    if (!adminStatus) {
      return { isAdmin: false, userId: session.user.id, error: "Forbidden" };
    }

    return { isAdmin: true, userId: session.user.id };
  } catch (error) {
    console.error("Admin access check failed:", error);
    return { isAdmin: false, userId: null, error: "Server error" };
  }
}

/**
 * 管理者アクセスを要求するミドルウェア的関数
 * @throws アクセス権がない場合はエラーをスロー
 */
export async function requireAdminAccess(): Promise<{ userId: string }> {
  const { isAdmin, userId, error } = await checkAdminAccess();

  if (!isAdmin || !userId) {
    throw new Error(error || "Access denied");
  }

  return { userId };
}
