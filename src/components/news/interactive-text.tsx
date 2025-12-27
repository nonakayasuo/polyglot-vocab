"use client";

import { Loader2, Plus, Volume2, X, Sparkles } from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import { speak } from "@/lib/tts";
import type { CEFRLevel } from "@/lib/word-difficulty";
import { getCEFRLevel } from "@/lib/word-difficulty";

// ========================================
// 型定義
// ========================================

interface WordDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
  examples?: string[];
}

interface WordPopoverState {
  word: string;
  x: number;
  y: number;
  definition?: WordDefinition;
  cefrLevel?: CEFRLevel | null;
  loading: boolean;
}

interface InteractiveTextProps {
  text: string;
  language?: string;
  highlightLevel?: CEFRLevel; // このレベル以上の単語をハイライト
  articleSource?: string;
  articleId?: string;
  onWordAdded?: (word: string) => void;
}

// ========================================
// CEFRレベルに応じたスタイル
// ========================================

const LEVEL_STYLES: Record<CEFRLevel, { bg: string; border: string; text: string }> = {
  A1: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  A2: { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700" },
  B1: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  B2: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  C1: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  C2: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
};

const LEVEL_LABELS: Record<CEFRLevel, string> = {
  A1: "初級",
  A2: "初中級",
  B1: "中級",
  B2: "中上級",
  C1: "上級",
  C2: "ネイティブ級",
};

// ========================================
// メインコンポーネント
// ========================================

export function InteractiveText({
  text,
  language = "english",
  highlightLevel = "B2",
  articleSource,
  articleId,
  onWordAdded,
}: InteractiveTextProps) {
  const [popover, setPopover] = useState<WordPopoverState | null>(null);
  const [addingWord, setAddingWord] = useState(false);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());

  // テキストを単語に分割
  const tokens = useMemo(() => {
    return tokenizeText(text);
  }, [text]);

  // 単語クリック時の処理
  const handleWordClick = useCallback(
    async (event: React.MouseEvent<HTMLSpanElement>, word: string) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const cleanWord = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();

      if (!cleanWord || cleanWord.length < 2) return;

      setPopover({
        word: cleanWord,
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 8,
        cefrLevel: getCEFRLevel(cleanWord),
        loading: true,
      });

      try {
        // Free Dictionary API で定義を取得
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`
        );

        if (response.ok) {
          const data = await response.json();
          const entry = data[0];
          const meaning = entry.meanings?.[0];
          const examples = meaning?.definitions
            ?.slice(0, 2)
            .map((d: { example?: string }) => d.example)
            .filter(Boolean);

          setPopover((prev) =>
            prev
              ? {
                  ...prev,
                  loading: false,
                  definition: {
                    word: entry.word,
                    phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
                    partOfSpeech: meaning?.partOfSpeech,
                    definition: meaning?.definitions?.[0]?.definition,
                    examples,
                  },
                }
              : null
          );
        } else {
          setPopover((prev) =>
            prev ? { ...prev, loading: false } : null
          );
        }
      } catch {
        setPopover((prev) =>
          prev ? { ...prev, loading: false } : null
        );
      }
    },
    []
  );

  // ポップオーバーを閉じる
  const closePopover = useCallback(() => {
    setPopover(null);
  }, []);

  // 単語を単語帳に追加
  const addToVocabulary = useCallback(async () => {
    if (!popover) return;

    setAddingWord(true);
    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: popover.definition?.word || popover.word,
          pronunciation: popover.definition?.phonetic || "",
          category: mapPartOfSpeech(popover.definition?.partOfSpeech),
          meaning: popover.definition?.definition || "",
          example: popover.definition?.examples?.[0] || "",
          exampleTranslation: "",
          note: articleSource ? `[${articleSource}] Article ID: ${articleId}` : "",
          language,
          check1: false,
          check2: false,
          check3: false,
        }),
      });

      if (response.ok) {
        setAddedWords((prev) => new Set([...prev, popover.word]));
        onWordAdded?.(popover.word);
        closePopover();
      }
    } catch (error) {
      console.error("Failed to add word:", error);
    } finally {
      setAddingWord(false);
    }
  }, [popover, articleSource, articleId, language, onWordAdded, closePopover]);

  // ハイライトすべきレベルかどうか
  const shouldHighlight = useCallback(
    (word: string): CEFRLevel | null => {
      const cleanWord = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
      if (cleanWord.length < 3) return null;

      const level = getCEFRLevel(cleanWord);
      if (!level) return null;

      const levelOrder: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const highlightIndex = levelOrder.indexOf(highlightLevel);
      const wordIndex = levelOrder.indexOf(level);

      return wordIndex >= highlightIndex ? level : null;
    },
    [highlightLevel]
  );

  return (
    <div className="relative">
      {/* テキスト本体 */}
      <div className="text-gray-800 leading-relaxed text-lg">
        {tokens.map((token, index) => {
          if (token.type === "word") {
            const level = shouldHighlight(token.content);
            const isAdded = addedWords.has(token.content.toLowerCase());

            if (level) {
              const styles = LEVEL_STYLES[level];
              return (
                <span
                  key={index}
                  onClick={(e) => handleWordClick(e, token.content)}
                  className={`
                    cursor-pointer px-0.5 rounded transition-all
                    ${styles.bg} ${styles.text}
                    hover:ring-2 hover:ring-offset-1 hover:${styles.border}
                    ${isAdded ? "opacity-50 line-through" : ""}
                  `}
                  title={`${level} - ${LEVEL_LABELS[level]}`}
                >
                  {token.content}
                </span>
              );
            }

            return (
              <span
                key={index}
                onClick={(e) => handleWordClick(e, token.content)}
                className="cursor-pointer hover:bg-gray-100 rounded px-0.5 transition-colors"
              >
                {token.content}
              </span>
            );
          }

          // 空白や句読点はそのまま
          return <span key={index}>{token.content}</span>;
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-4 h-4" />
          <span>難易度:</span>
          {(["B2", "C1", "C2"] as CEFRLevel[]).map((level) => (
            <span
              key={level}
              className={`px-2 py-0.5 rounded ${LEVEL_STYLES[level].bg} ${LEVEL_STYLES[level].text}`}
            >
              {level} ({LEVEL_LABELS[level]})
            </span>
          ))}
        </div>
      </div>

      {/* 単語ポップオーバー */}
      {popover && (
        <>
          <div className="fixed inset-0 z-40" onClick={closePopover} />

          <div
            className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[300px] max-w-[400px]"
            style={{
              left: `${Math.min(Math.max(popover.x, 200), window.innerWidth - 220)}px`,
              top: `${popover.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={closePopover}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {popover.loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div>
                {/* ヘッダー */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {popover.definition?.word || popover.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() => speak(popover.definition?.word || popover.word, "english")}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {popover.cefrLevel && (
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        LEVEL_STYLES[popover.cefrLevel].bg
                      } ${LEVEL_STYLES[popover.cefrLevel].text}`}
                    >
                      {popover.cefrLevel}
                    </span>
                  )}
                </div>

                {/* 発音 */}
                {popover.definition?.phonetic && (
                  <p className="text-gray-500 font-mono text-sm mb-2">
                    /{popover.definition.phonetic}/
                  </p>
                )}

                {/* 品詞 */}
                {popover.definition?.partOfSpeech && (
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded mb-3">
                    {popover.definition.partOfSpeech}
                  </span>
                )}

                {/* 定義 */}
                {popover.definition?.definition ? (
                  <p className="text-gray-700 text-sm mb-3">
                    {popover.definition.definition}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic mb-3">
                    定義が見つかりませんでした
                  </p>
                )}

                {/* 例文 */}
                {popover.definition?.examples && popover.definition.examples.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Example:</p>
                    <p className="text-sm text-gray-700 italic">
                      "{popover.definition.examples[0]}"
                    </p>
                  </div>
                )}

                {/* 追加ボタン */}
                <button
                  type="button"
                  onClick={addToVocabulary}
                  disabled={addingWord || addedWords.has(popover.word)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingWord ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : addedWords.has(popover.word) ? (
                    "追加済み ✓"
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      単語帳に追加
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ========================================
// ヘルパー関数
// ========================================

interface Token {
  type: "word" | "space" | "punctuation";
  content: string;
}

function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /([a-zA-Z'-]+)|(\s+)|([^\sa-zA-Z'-]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: "word", content: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "space", content: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "punctuation", content: match[3] });
    }
  }

  return tokens;
}

function mapPartOfSpeech(pos?: string): string {
  if (!pos) return "Other";
  const map: Record<string, string> = {
    noun: "Noun",
    verb: "Verb",
    adjective: "Adjective",
    adverb: "Adverb",
    pronoun: "Pronoun",
    preposition: "Preposition",
    conjunction: "Conjunction",
    interjection: "Interjection",
  };
  return map[pos.toLowerCase()] || "Other";
}

