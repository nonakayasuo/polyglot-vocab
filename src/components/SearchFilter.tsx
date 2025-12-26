"use client";

import { BookCheck, BookX, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  type FilterOptions,
  LANGUAGES,
  WORD_SOURCES,
} from "@/types/vocabulary";

interface Props {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
  hideLanguageFilter?: boolean;
}

// 進捗フィルタータブの定義
const progressTabs = [
  { value: "all", label: "すべて", icon: null },
  { value: "notLearned", label: "未学習", icon: BookX },
  { value: "learned", label: "習得済み", icon: BookCheck },
];

export default function SearchFilter({
  filters,
  onChange,
  totalCount,
  filteredCount,
  hideLanguageFilter = false,
}: Props) {
  const handleChange = (key: keyof FilterOptions, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      search: "",
      language: filters.language, // 言語ページの場合は維持
      category: "all",
      source: "all",
      status: "all",
      sortBy: "displayOrder",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.source !== "all" ||
    filters.status !== "all";

  // ソースをカテゴリ別にグループ化
  const newsSources = WORD_SOURCES.filter((s) => s.category === "news");
  const examSources = WORD_SOURCES.filter((s) => s.category === "exam");

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      {/* 進捗フィルタータブ */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-3">
        {progressTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleChange("status", tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filters.status === tab.value
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* 件数表示 */}
        <div className="ml-auto">
          <Badge
            variant="secondary"
            className="font-normal bg-gray-100 text-gray-600"
          >
            {filteredCount === totalCount ? (
              <span>{totalCount} 件</span>
            ) : (
              <span>
                {filteredCount} / {totalCount} 件
              </span>
            )}
          </Badge>
        </div>
      </div>

      {/* 検索バー & フィルター */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 検索 */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="単語、意味、例文で検索..."
            className="pl-9 h-9 bg-white border-gray-200"
          />
          {filters.search && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleChange("search", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* 言語フィルター */}
        {!hideLanguageFilter && (
          <Select
            value={filters.language}
            onValueChange={(value) => handleChange("language", value)}
          >
            <SelectTrigger
              size="sm"
              className="w-auto min-w-[140px] bg-white border-gray-200"
            >
              <SelectValue placeholder="言語" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌐 すべての言語</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.flag} {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 品詞フィルター */}
        <Select
          value={filters.category}
          onValueChange={(value) => handleChange("category", value)}
        >
          <SelectTrigger
            size="sm"
            className="w-auto min-w-[130px] bg-white border-gray-200"
          >
            <SelectValue placeholder="品詞" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての品詞</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ソースフィルター */}
        <Select
          value={filters.source}
          onValueChange={(value) => handleChange("source", value)}
        >
          <SelectTrigger
            size="sm"
            className="w-auto min-w-[140px] bg-white border-gray-200"
          >
            <SelectValue placeholder="出典" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📚 すべての出典</SelectItem>
            {/* ニュースソース */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
              📰 ニュースメディア
            </div>
            {newsSources.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.icon} {source.shortLabel}
              </SelectItem>
            ))}
            {/* 試験ソース */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
              📚 試験・資格
            </div>
            {examSources.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.icon} {source.shortLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* クリアボタン */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-3 h-3 mr-1" />
            クリア
          </Button>
        )}
      </div>
    </div>
  );
}
