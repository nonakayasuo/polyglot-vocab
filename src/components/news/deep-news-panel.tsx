"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  ExternalLink,
  Globe,
  Layers,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// ========================================
// 型定義
// ========================================

interface TimelineArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface Perspective {
  source: string;
  sourceIcon?: string;
  title: string;
  excerpt: string;
  url: string;
  bias?: string;
}

interface BackgroundInfo {
  historical: string;
  cultural: string;
  keyTerms: Array<{ term: string; definition: string }>;
}

interface DeepNewsPanelProps {
  articleId: string;
  topicName: string;
  timeline?: TimelineArticle[];
  perspectives?: Perspective[];
  background?: BackgroundInfo;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

// ========================================
// ソースアイコンマッピング
// ========================================

const SOURCE_ICONS: Record<string, string> = {
  BBC: "🇬🇧",
  CNN: "🇺🇸",
  "The Guardian": "🇬🇧",
  "Al Jazeera": "🌍",
  "NHK World": "🇯🇵",
  Reuters: "📰",
  "Associated Press": "📡",
};

// ========================================
// メインコンポーネント
// ========================================

export function DeepNewsPanel({
  topicName,
  timeline = [],
  perspectives = [],
  background,
  onLoadMore,
  isLoading = false,
}: DeepNewsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "perspectives" | "background"
  >("timeline");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["historical"]),
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const tabs = [
    {
      id: "timeline" as const,
      label: "タイムライン",
      icon: Clock,
      count: timeline.length,
    },
    {
      id: "perspectives" as const,
      label: "多視点",
      icon: Globe,
      count: perspectives.length,
    },
    {
      id: "background" as const,
      label: "背景",
      icon: BookOpen,
      count: undefined as number | undefined,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5" />
          <h2 className="font-bold">Deep News Integration</h2>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          「{topicName}」の多層的な理解
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 h-auto rounded-none text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <div className="space-y-0">
                {timeline.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>タイムラインデータがありません</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-600" />

                    {timeline.map((article, index) => (
                      <div
                        key={article.id}
                        className="relative pl-10 pb-6 last:pb-0"
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                            index === 0
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-500"
                          }`}
                        />

                        {/* Article Card */}
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">
                                  {SOURCE_ICONS[article.source] || "📰"}
                                </span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {article.source}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                                {article.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(
                                  article.publishedAt,
                                ).toLocaleDateString("ja-JP", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Load More */}
                    {onLoadMore && (
                      <Button
                        variant="ghost"
                        onClick={onLoadMore}
                        className="w-full mt-4 py-2 h-auto text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        さらに読み込む
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Perspectives Tab */}
            {activeTab === "perspectives" && (
              <div className="space-y-4">
                {perspectives.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>多視点データがありません</p>
                  </div>
                ) : (
                  perspectives.map((perspective) => (
                    <div
                      key={`${perspective.source}-${perspective.title}`}
                      className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {SOURCE_ICONS[perspective.source] || "📰"}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {perspective.source}
                        </span>
                        {perspective.bias && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                            {perspective.bias}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-2">
                        {perspective.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {perspective.excerpt}
                      </p>
                      <a
                        href={perspective.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        記事を読む
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Background Tab */}
            {activeTab === "background" && (
              <div className="space-y-4">
                {!background ? (
                  <div className="text-center py-8 text-gray-500">
                    <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>背景情報を読み込み中...</p>
                    <Button
                      onClick={onLoadMore}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      AIで生成
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Historical Context */}
                    <div className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
                      <Button
                        variant="ghost"
                        onClick={() => toggleSection("historical")}
                        className="w-full flex items-center justify-between p-4 h-auto rounded-none bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          📜 歴史的背景
                        </span>
                        {expandedSections.has("historical") ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </Button>
                      {expandedSections.has("historical") && (
                        <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {background.historical}
                        </div>
                      )}
                    </div>

                    {/* Cultural Context */}
                    <div className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
                      <Button
                        variant="ghost"
                        onClick={() => toggleSection("cultural")}
                        className="w-full flex items-center justify-between p-4 h-auto rounded-none bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          🌍 文化的背景
                        </span>
                        {expandedSections.has("cultural") ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </Button>
                      {expandedSections.has("cultural") && (
                        <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {background.cultural}
                        </div>
                      )}
                    </div>

                    {/* Key Terms */}
                    {background.keyTerms.length > 0 && (
                      <div className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
                        <Button
                          variant="ghost"
                          onClick={() => toggleSection("keyTerms")}
                          className="w-full flex items-center justify-between p-4 h-auto rounded-none bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            📚 重要用語
                          </span>
                          {expandedSections.has("keyTerms") ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </Button>
                        {expandedSections.has("keyTerms") && (
                          <div className="p-4 space-y-3">
                            {background.keyTerms.map((term) => (
                              <div key={term.term} className="flex gap-2">
                                <span className="font-medium text-blue-600 dark:text-blue-400 shrink-0">
                                  {term.term}:
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {term.definition}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
