import {
  BarChart3,
  FileText,
  Home,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

// 管理者のメールアドレスリスト（環境変数から取得も可能）
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user?.email) return false;
  return ADMIN_EMAILS.includes(session.user.email);
}

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: Home },
  { href: "/admin/users", label: "ユーザー管理", icon: Users },
  { href: "/admin/stats", label: "統計", icon: BarChart3 },
  { href: "/admin/content", label: "コンテンツ", icon: FileText },
  { href: "/admin/settings", label: "設定", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white">
        <div className="flex h-full flex-col">
          {/* ロゴ */}
          <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">NewsLingua</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ユーザー情報 */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {session.user.name || "Admin"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
