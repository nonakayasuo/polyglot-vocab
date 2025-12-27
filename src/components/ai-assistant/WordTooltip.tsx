"use client";

import {
  AlertTriangle,
  BookOpen,
  Flame,
  Loader2,
  Plus,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface WordTooltipProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToVocabulary: (word: string, data: WordData) => void;
}

type Register = "FORMAL" | "NEUTRAL" | "CASUAL" | "SLANG" | "TABOO";

interface WordData {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  examples: string[];
  register?: Register;
  tpoAdvice?: string;
}

interface ContentSettings {
  showSlang: boolean;
  showTaboo: boolean;
}

const REGISTER_STYLES: Record<
  Register,
  { bg: string; text: string; icon: string; label: string }
> = {
  FORMAL: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    icon: "💼",
    label: "フォーマル",
  },
  NEUTRAL: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    icon: "💬",
    label: "ニュートラル",
  },
  CASUAL: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    icon: "🗣️",
    label: "カジュアル",
  },
  SLANG: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    icon: "🔥",
    label: "スラング",
  },
  TABOO: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    icon: "🔞",
    label: "タブー",
  },
};

export default function WordTooltip({
  word,
  position,
  onClose,
  onAddToVocabulary,
}: WordTooltipProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    showSlang: true,
    showTaboo: false,
  });
  const [isBlocked, setIsBlocked] = useState(false);

  // コンテンツ設定を取得
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/content-settings");
        if (res.ok) {
          const data = await res.json();
          setContentSettings({
            showSlang: data.showSlang ?? true,
            showTaboo: data.showTaboo ?? false,
          });
        }
      } catch {
        // デフォルト設定を使用
      }
    };
    fetchSettings();
  }, []);

  // 単語データを取得
  const fetchWordData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Free Dictionary APIを使用
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word
        )}`
      );

      if (res.ok) {
        const data = await res.json();
        const entry = data[0];
        const meaning = entry?.meanings?.[0];

        // レジスターを推定（実際はAIで判定）
        const estimatedRegister = estimateRegister(word, meaning?.definitions);

        // 設定に基づいてブロック判定
        if (
          (estimatedRegister === "SLANG" && !contentSettings.showSlang) ||
          (estimatedRegister === "TABOO" && !contentSettings.showTaboo)
        ) {
          setIsBlocked(true);
          setWordData(null);
        } else {
          setWordData({
            word: entry.word,
            pronunciation: entry.phonetic || entry.phonetics?.[0]?.text || "",
            partOfSpeech: meaning?.partOfSpeech || "unknown",
            definition: meaning?.definitions?.[0]?.definition || "",
            examples:
              meaning?.definitions
                ?.slice(0, 2)
                .map((d: { example?: string }) => d.example)
                .filter(Boolean) || [],
            register: estimatedRegister,
            tpoAdvice: generateTPOAdvice(estimatedRegister),
          });
        }
      } else {
        // フォールバック
        setWordData({
          word,
          pronunciation: "",
          partOfSpeech: "unknown",
          definition: "定義が見つかりませんでした",
          examples: [],
          register: "NEUTRAL",
        });
      }
    } catch {
      setWordData({
        word,
        pronunciation: "",
        partOfSpeech: "unknown",
        definition: "単語情報を取得できませんでした",
        examples: [],
        register: "NEUTRAL",
      });
    } finally {
      setIsLoading(false);
    }
  }, [word, contentSettings]);

  useEffect(() => {
    fetchWordData();
  }, [fetchWordData]);

  // レジスターを推定（簡易版）
  const estimateRegister = (
    word: string,
    definitions?: Array<{ definition: string }>
  ): Register => {
    const slangWords = [
      "slay",
      "lit",
      "goat",
      "sus",
      "bet",
      "cap",
      "bussin",
      "rizz",
      "delulu",
      "ate",
      "vibe",
      "lowkey",
      "highkey",
      "flex",
      "salty",
      "ghost",
      "simp",
      "stan",
      "tea",
      "yeet",
    ];
    const tabooWords = ["damn", "hell", "crap", "ass", "shit", "fuck"];

    const lowerWord = word.toLowerCase();

    if (tabooWords.some((tw) => lowerWord.includes(tw))) {
      return "TABOO";
    }
    if (slangWords.includes(lowerWord)) {
      return "SLANG";
    }

    // 定義からも推定
    const defText = definitions?.map((d) => d.definition).join(" ") || "";
    if (
      defText.includes("informal") ||
      defText.includes("slang") ||
      defText.includes("colloquial")
    ) {
      return "SLANG";
    }
    if (
      defText.includes("vulgar") ||
      defText.includes("offensive") ||
      defText.includes("taboo")
    ) {
      return "TABOO";
    }
    if (defText.includes("formal") || defText.includes("literary")) {
      return "FORMAL";
    }

    return "NEUTRAL";
  };

  // TPOアドバイス生成
  const generateTPOAdvice = (register: Register): string => {
    switch (register) {
      case "FORMAL":
        return "ビジネスや学術的な場面で使用できます";
      case "NEUTRAL":
        return "ほとんどの場面で使用できます";
      case "CASUAL":
        return "友人との会話など、カジュアルな場面で使用します";
      case "SLANG":
        return "SNSや若者同士の会話で使用。ビジネスでは避けましょう";
      case "TABOO":
        return "⚠️ 非常にカジュアルな場面のみ。公の場では避けてください";
    }
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleAddToVocabulary = () => {
    if (wordData) {
      onAddToVocabulary(word, wordData);
      setIsAdded(true);
    }
  };

  // ポジション調整
  const tooltipStyle = {
    top: position.y + 10,
    left: Math.min(position.x, window.innerWidth - 320),
  };

  return (
    <>
      {/* オーバーレイ */}
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        onClick={onClose}
        aria-label="閉じる"
      />

      {/* ツールチップ */}
      <div
        className="fixed z-50 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        style={tooltipStyle}
      >
        {isLoading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : isBlocked ? (
          <div className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-slate-300 mb-2">
              この単語は非表示に設定されています
            </p>
            <p className="text-sm text-slate-500">
              設定 → コンテンツ設定 から表示を有効にできます
            </p>
          </div>
        ) : wordData ? (
          <>
            {/* ヘッダー */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {wordData.word}
                    </h3>
                    {wordData.register && wordData.register !== "NEUTRAL" && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          REGISTER_STYLES[wordData.register].bg
                        } ${REGISTER_STYLES[wordData.register].text}`}
                      >
                        {REGISTER_STYLES[wordData.register].icon}{" "}
                        {REGISTER_STYLES[wordData.register].label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {wordData.pronunciation && `${wordData.pronunciation} • `}
                    {wordData.partOfSpeech}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleSpeak}
                  className="text-emerald-400 hover:bg-slate-700/50"
                  title="発音を聞く"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-4">
              <p className="text-slate-200 mb-3">{wordData.definition}</p>

              {/* TPOアドバイス */}
              {wordData.register &&
                wordData.register !== "NEUTRAL" &&
                wordData.tpoAdvice && (
                  <div
                    className={`flex items-start gap-2 p-2 rounded-lg mb-3 ${
                      REGISTER_STYLES[wordData.register].bg
                    }`}
                  >
                    <Flame className="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
                    <p className="text-xs text-slate-300">
                      {wordData.tpoAdvice}
                    </p>
                  </div>
                )}

              {wordData.examples.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-slate-400 uppercase mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    例文
                  </h4>
                  <ul className="space-y-2">
                    {wordData.examples.map((example, idx) => (
                      <li
                        key={`example-${idx}`}
                        className="text-sm text-slate-300 pl-3 border-l-2 border-emerald-500/50"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* アクション */}
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <Button
                onClick={handleAddToVocabulary}
                disabled={isAdded}
                className={`flex-1 ${
                  isAdded
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isAdded ? "追加済み" : "単語帳に追加"}
              </Button>
              <Button
                variant="ghost"
                className="px-4 bg-slate-700 hover:bg-slate-600 text-white"
                title="詳しく聞く"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-slate-400">
            単語情報を取得できませんでした
          </div>
        )}
      </div>
    </>
  );
}
