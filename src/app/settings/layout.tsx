import { Bell, CreditCard, Filter, Globe, Shield, User } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/settings/profile", label: "プロフィール", icon: User },
  { href: "/settings/content", label: "コンテンツ設定", icon: Filter },
  { href: "/settings/notifications", label: "通知", icon: Bell },
  { href: "/settings/billing", label: "請求・プラン", icon: CreditCard },
  { href: "/settings/language", label: "言語設定", icon: Globe },
  { href: "/settings/security", label: "セキュリティ", icon: Shield },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          設定
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* サイドナビ */}
          <nav className="w-full md:w-64 shrink-0">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
