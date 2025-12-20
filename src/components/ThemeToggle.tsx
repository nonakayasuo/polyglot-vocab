"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 rounded-lg bg-secondary/50 text-muted-foreground"
        aria-label="テーマを切り替え"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "ライト";
      case "dark":
        return "ダーク";
      default:
        return "システム";
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm"
      aria-label={`現在のテーマ: ${getLabel()}. クリックで切り替え`}
      title={`テーマ: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline text-xs">{getLabel()}</span>
    </button>
  );
}
