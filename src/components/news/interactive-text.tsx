"use client";

import {
  AlertTriangle,
  Flame,
  Loader2,
  MessageSquare,
  Plus,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { speak } from "@/lib/tts";
import type { CEFRLevel } from "@/lib/word-difficulty";
import { getCEFRLevel } from "@/lib/word-difficulty";

// ========================================
// 型定義
// ========================================

// レジスター（フォーマル度）の型
type Register = "FORMAL" | "NEUTRAL" | "CASUAL" | "SLANG" | "TABOO";

interface WordDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
  examples?: string[];
  register?: Register;
  tpoAdvice?: string;
  synonyms?: Array<{ word: string; register: Register }>;
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
  showRegister?: boolean; // レジスター表示を有効化
  showSlang?: boolean; // スラング表示
  showTaboo?: boolean; // タブー表現表示（18+）
}

// ========================================
// レジスター関連の設定
// ========================================

const REGISTER_STYLES: Record<
  Register,
  { bg: string; border: string; text: string; icon: string }
> = {
  FORMAL: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "💼",
  },
  NEUTRAL: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: "💬",
  },
  CASUAL: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "🗣️",
  },
  SLANG: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: "🔥",
  },
  TABOO: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "🔞",
  },
};

const REGISTER_LABELS: Record<Register, { en: string; ja: string }> = {
  FORMAL: { en: "Formal", ja: "フォーマル" },
  NEUTRAL: { en: "Neutral", ja: "一般的" },
  CASUAL: { en: "Casual", ja: "カジュアル" },
  SLANG: { en: "Slang", ja: "スラング" },
  TABOO: { en: "Taboo", ja: "タブー表現" },
};

// スラング単語のサンプルデータ（実際はAPIから取得）
const SLANG_DICTIONARY: Record<
  string,
  {
    register: Register;
    meaning: string;
    tpoAdvice: string;
    synonyms: Array<{ word: string; register: Register }>;
  }
> = {
  slay: {
    register: "SLANG",
    meaning: "圧倒的に素晴らしいパフォーマンスをする",
    tpoAdvice: "SNS、友人との会話で使用。ビジネスシーンでは避ける",
    synonyms: [
      { word: "excel", register: "FORMAL" },
      { word: "do great", register: "NEUTRAL" },
      { word: "kill it", register: "CASUAL" },
      { word: "crush it", register: "SLANG" },
    ],
  },
  lit: {
    register: "SLANG",
    meaning: "最高に楽しい、盛り上がっている",
    tpoAdvice: "若者同士の会話、パーティーの話題で使用",
    synonyms: [
      { word: "exciting", register: "FORMAL" },
      { word: "fun", register: "NEUTRAL" },
      { word: "awesome", register: "CASUAL" },
      { word: "fire", register: "SLANG" },
    ],
  },
  sus: {
    register: "SLANG",
    meaning: "怪しい、疑わしい",
    tpoAdvice: "カジュアルな会話、ゲーム中で使用。Among Usから広まった表現",
    synonyms: [
      { word: "suspicious", register: "FORMAL" },
      { word: "sketchy", register: "CASUAL" },
      { word: "fishy", register: "CASUAL" },
    ],
  },
  ghosting: {
    register: "SLANG",
    meaning: "突然連絡を絶つこと",
    tpoAdvice: "恋愛やデートの話題で使用。ビジネスでも使われることがある",
    synonyms: [
      { word: "ignoring", register: "NEUTRAL" },
      { word: "disappearing", register: "NEUTRAL" },
    ],
  },
  flex: {
    register: "SLANG",
    meaning: "自慢する、見せびらかす",
    tpoAdvice: "SNS、カジュアルな会話で使用",
    synonyms: [
      { word: "show off", register: "NEUTRAL" },
      { word: "boast", register: "FORMAL" },
      { word: "brag", register: "CASUAL" },
    ],
  },
  lowkey: {
    register: "SLANG",
    meaning: "ちょっと、密かに、控えめに",
    tpoAdvice: "若者同士の会話、SNSで使用",
    synonyms: [
      { word: "somewhat", register: "FORMAL" },
      { word: "kind of", register: "NEUTRAL" },
      { word: "secretly", register: "NEUTRAL" },
    ],
  },
  goat: {
    register: "SLANG",
    meaning: "史上最高の人物（Greatest Of All Time）",
    tpoAdvice: "スポーツ、音楽、エンタメの話題で使用",
    synonyms: [
      { word: "the best", register: "NEUTRAL" },
      { word: "legendary", register: "FORMAL" },
    ],
  },
};

// ========================================
// CEFRレベルに応じたスタイル
// ========================================

const LEVEL_STYLES: Record<
  CEFRLevel,
  { bg: string; border: string; text: string }
> = {
  A1: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  A2: { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700" },
  B1: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
  },
  B2: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
  },
  C1: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  C2: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
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
  showRegister = true,
  showSlang = true,
  showTaboo = false,
}: InteractiveTextProps) {
  const [popover, setPopover] = useState<WordPopoverState | null>(null);
  const [addingWord, setAddingWord] = useState(false);
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set());

  // スラング単語かどうかをチェック
  const getSlangInfo = useCallback((word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-zA-Z'-]/g, "");
    return SLANG_DICTIONARY[cleanWord] || null;
  }, []);

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

      // スラング情報をチェック
      const slangInfo = getSlangInfo(cleanWord);

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
          `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`,
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
                    definition:
                      slangInfo?.meaning ||
                      meaning?.definitions?.[0]?.definition,
                    examples,
                    register: slangInfo?.register || "NEUTRAL",
                    tpoAdvice: slangInfo?.tpoAdvice,
                    synonyms: slangInfo?.synonyms,
                  },
                }
              : null,
          );
        } else {
          // APIが失敗してもスラング情報があれば表示
          setPopover((prev) =>
            prev
              ? {
                  ...prev,
                  loading: false,
                  definition: slangInfo
                    ? {
                        word: cleanWord,
                        definition: slangInfo.meaning,
                        register: slangInfo.register,
                        tpoAdvice: slangInfo.tpoAdvice,
                        synonyms: slangInfo.synonyms,
                      }
                    : undefined,
                }
              : null,
          );
        }
      } catch {
        setPopover((prev) => (prev ? { ...prev, loading: false } : null));
      }
    },
    [getSlangInfo],
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
          note: articleSource
            ? `[${articleSource}] Article ID: ${articleId}`
            : "",
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
    [highlightLevel],
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
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey: トークンは重複する可能性があるため
                  key={`word-${index}`}
                  onClick={(e) => handleWordClick(e, token.content)}
                  className={`
                    cursor-pointer px-0.5 rounded transition-all bg-transparent border-none font-inherit text-inherit
                    ${styles.bg} ${styles.text}
                    hover:ring-2 hover:ring-offset-1 hover:${styles.border}
                    ${isAdded ? "opacity-50 line-through" : ""}
                  `}
                  title={`${level} - ${LEVEL_LABELS[level]}`}
                >
                  {token.content}
                </button>
              );
            }

            return (
              <button
                type="button"
                // biome-ignore lint/suspicious/noArrayIndexKey: トークンは重複する可能性があるため
                key={`word-${index}`}
                onClick={(e) => handleWordClick(e, token.content)}
                className="cursor-pointer hover:bg-gray-100 rounded px-0.5 transition-colors bg-transparent border-none font-inherit text-inherit"
              >
                {token.content}
              </button>
            );
          }

          // 空白や句読点はそのまま
          // biome-ignore lint/suspicious/noArrayIndexKey: トークンは重複する可能性があるため
          return <span key={`token-${index}`}>{token.content}</span>;
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
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={closePopover}
            aria-label="閉じる"
          />

          <div
            className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[300px] max-w-[400px]"
            style={{
              left: `${Math.min(
                Math.max(popover.x, 200),
                window.innerWidth - 220,
              )}px`,
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
                    onClick={() =>
                      speak(popover.definition?.word || popover.word, "english")
                    }
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

                {/* レジスターバッジ */}
                {showRegister && popover.definition?.register && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                        REGISTER_STYLES[popover.definition.register].bg
                      } ${REGISTER_STYLES[popover.definition.register].text}`}
                    >
                      <span>
                        {REGISTER_STYLES[popover.definition.register].icon}
                      </span>
                      {REGISTER_LABELS[popover.definition.register].ja}
                    </span>
                    {popover.definition.register === "SLANG" && (
                      <Flame className="w-4 h-4 text-orange-500" />
                    )}
                    {popover.definition.register === "TABOO" && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}

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

                {/* TPOアドバイス */}
                {showRegister && popover.definition?.tpoAdvice && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-800 mb-1">
                          使用場面
                        </p>
                        <p className="text-xs text-amber-700">
                          {popover.definition.tpoAdvice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 類語レジスターマップ */}
                {showRegister &&
                  popover.definition?.synonyms &&
                  popover.definition.synonyms.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-2">
                        📊 レジスター別の類語:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {popover.definition.synonyms
                          .filter((s) => {
                            if (s.register === "TABOO" && !showTaboo)
                              return false;
                            if (s.register === "SLANG" && !showSlang)
                              return false;
                            return true;
                          })
                          .map((syn, idx) => (
                            <span
                              // biome-ignore lint/suspicious/noArrayIndexKey: synonyms are unique
                              key={idx}
                              className={`px-2 py-0.5 text-xs rounded ${
                                REGISTER_STYLES[syn.register].bg
                              } ${REGISTER_STYLES[syn.register].text}`}
                              title={REGISTER_LABELS[syn.register].ja}
                            >
                              {REGISTER_STYLES[syn.register].icon} {syn.word}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                {/* 例文 */}
                {popover.definition?.examples &&
                  popover.definition.examples.length > 0 && (
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
  let match = regex.exec(text);

  while (match !== null) {
    if (match[1]) {
      tokens.push({ type: "word", content: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "space", content: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "punctuation", content: match[3] });
    }
    match = regex.exec(text);
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
