"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 初期テーマを確認
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // マウント前はプレースホルダーを表示（ハイドレーションエラー回避）
  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
        aria-label="テーマ切り替え"
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
      title={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      aria-label="テーマ切り替え"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

