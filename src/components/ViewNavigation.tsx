"use client";

import { BarChart3, BookOpen, Layers } from "lucide-react";

type View = "list" | "flashcard" | "stats";

interface ViewNavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const views: { value: View; label: string; icon: typeof Layers }[] = [
  { value: "list", label: "単語一覧", icon: Layers },
  { value: "flashcard", label: "フラッシュカード", icon: BookOpen },
  { value: "stats", label: "統計", icon: BarChart3 },
];

export function ViewNavigation({
  currentView,
  onViewChange,
}: ViewNavigationProps) {
  return (
    <nav className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      {views.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onViewChange(value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentView === value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}
