"use client";

import { Check, Languages, Trash2, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createWord,
  deleteWordAPI,
  deleteWordsAPI,
  updateWordAPI,
  type VocabularyWordDB,
} from "@/lib/api";
import { speak } from "@/lib/tts";
import {
  CATEGORIES,
  type Category,
  type FilterOptions,
  type Language,
} from "@/types/vocabulary";

interface Props {
  words: VocabularyWordDB[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onEdit: (word: VocabularyWordDB) => void;
  onRefresh: () => void;
  onAddNew: () => void;
  defaultLanguage?: Language;
}

// デフォルトの列幅
const DEFAULT_COLUMN_WIDTHS = {
  checkbox: 40,
  progress: 80,
  word: 140,
  pronunciation: 100,
  category: 90,
  meaning: 150,
  example: 300,
  note: 120,
  actions: 50,
};

// 列幅をローカルストレージから取得/保存
const STORAGE_KEY = "vocabulary-table-column-widths";

function loadColumnWidths(): typeof DEFAULT_COLUMN_WIDTHS {
  if (typeof window === "undefined") return DEFAULT_COLUMN_WIDTHS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_COLUMN_WIDTHS, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_COLUMN_WIDTHS;
}

function saveColumnWidths(widths: typeof DEFAULT_COLUMN_WIDTHS) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  } catch {}
}

// リサイズ可能なヘッダー
function ResizableHeader({
  children,
  width,
  onResize,
  className = "",
}: {
  children: React.ReactNode;
  width: number;
  onResize: (width: number) => void;
  className?: string;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width],
  );

  useEffect(() => {
    if (!isResizing) return;

    // リサイズ中はbodyにクラスを追加してカーソルを固定
    document.body.classList.add("resizing");

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(50, startWidthRef.current + diff);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove("resizing");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("resizing");
    };
  }, [isResizing, onResize]);

  return (
    <TableHead
      className={`relative select-none ${className}`}
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      {children}
      {/* リサイズハンドル */}
      {/* biome-ignore lint/a11y/useSemanticElements: リサイズハンドルにはhrは不適切 */}
      {/* biome-ignore lint/a11y/useAriaPropsForRole: 列幅リサイズ用のカスタムコントロール */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={50}
        aria-label="列幅を調整"
        tabIndex={0}
        className={`absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize z-10 group flex items-center justify-center ${
          isResizing ? "bg-blue-100" : ""
        }`}
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onResize(Math.max(50, width - 10));
          if (e.key === "ArrowRight") onResize(width + 10);
        }}
      >
        <div
          className={`w-0.5 h-4 rounded-full transition-colors ${
            isResizing ? "bg-blue-500" : "bg-gray-300 group-hover:bg-blue-400"
          }`}
        />
      </div>
    </TableHead>
  );
}

// 品詞ごとの色設定（Notion風）
const getCategoryStyle = (category: string) => {
  const styles: Record<string, string> = {
    Noun: "bg-sky-100 text-sky-700 border-sky-200",
    Verb: "bg-orange-100 text-orange-700 border-orange-200",
    "V: Transitive": "bg-orange-100 text-orange-700 border-orange-200",
    "V: Intransitive": "bg-amber-100 text-amber-700 border-amber-200",
    "V: Phrasal": "bg-orange-100 text-orange-700 border-orange-200",
    Adjective: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Adverb: "bg-purple-100 text-purple-700 border-purple-200",
    Phrase: "bg-pink-100 text-pink-700 border-pink-200",
    Idiom: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Preposition: "bg-blue-100 text-blue-700 border-blue-200",
    Conjunction: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Other: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return styles[category] || styles.Other;
};

// 例文内の単語をハイライト
const highlightWord = (example: string, word: string) => {
  if (!example || !word) return example || "-";

  const wordLower = word.toLowerCase();
  const regex = new RegExp(
    `\\b(${word}|${wordLower}|${word}s|${word}ed|${word}ing|${word}d)\\b`,
    "gi",
  );

  const parts = example.split(regex);

  return parts.map((part, partIndex) => {
    if (part.toLowerCase().startsWith(wordLower.substring(0, 3))) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: Parts are static after split
        <span key={partIndex} className="text-red-500 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
};

// インライン編集可能なセル
function EditableCell({
  value,
  onChange,
  placeholder,
  className = "",
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleBlur();
    }
    if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-2 py-1 text-sm border border-blue-400 rounded outline-none resize-none bg-white ${className}`}
          rows={2}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-2 py-1 text-sm border border-blue-400 rounded outline-none bg-white ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setEditValue(value);
        setIsEditing(true);
      }}
      className={`px-2 py-1 rounded cursor-text hover:bg-gray-100 min-h-[28px] text-left w-full ${className} ${
        !value ? "text-gray-300" : ""
      }`}
    >
      {value || placeholder || "-"}
    </button>
  );
}

// 例文セル（翻訳切り替え付き）
function ExampleCell({
  word,
  onUpdate,
}: {
  word: VocabularyWordDB;
  onUpdate: (field: keyof VocabularyWordDB, value: string) => void;
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<"example" | "exampleTranslation">(
    "example",
  );
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (field: "example" | "exampleTranslation") => {
    setEditField(field);
    setEditValue(word[field] || "");
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editValue !== word[editField]) {
      onUpdate(editField, editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const currentText = showTranslation ? word.exampleTranslation : word.example;
  const hasTranslation = !!word.exampleTranslation;

  if (isEditing) {
    return (
      <div className="flex items-start gap-1">
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={
            editField === "example" ? "例文を入力..." : "日本語訳を入力..."
          }
          className="flex-1 px-2 py-1 text-sm border border-blue-400 rounded outline-none resize-none bg-white"
          rows={2}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1">
      {/* 翻訳切り替えボタン */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (showTranslation) {
            setShowTranslation(false);
          } else if (hasTranslation) {
            setShowTranslation(true);
          } else {
            // 翻訳がない場合は編集モードで日本語訳を入力
            handleStartEdit("exampleTranslation");
          }
        }}
        className={`flex-shrink-0 p-1 rounded transition-colors ${
          showTranslation
            ? "text-blue-500 bg-blue-50"
            : hasTranslation
              ? "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
              : "text-gray-300 hover:text-blue-400"
        }`}
        title={
          showTranslation
            ? "原文を表示"
            : hasTranslation
              ? "日本語訳を表示"
              : "日本語訳を追加"
        }
      >
        <Languages className="w-4 h-4" />
      </button>

      {/* 例文テキスト */}
      <button
        type="button"
        className="flex-1 px-2 py-1 rounded cursor-text hover:bg-gray-100 min-h-[28px] text-left"
        onClick={() =>
          handleStartEdit(showTranslation ? "exampleTranslation" : "example")
        }
      >
        {currentText ? (
          showTranslation ? (
            <span className="text-blue-700">{currentText}</span>
          ) : (
            highlightWord(currentText, word.word)
          )
        ) : (
          <span className="text-gray-300">
            {showTranslation ? "日本語訳を追加..." : "例文を追加..."}
          </span>
        )}
      </button>
    </div>
  );
}

// カテゴリ選択セル
function CategoryCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsEditing(false);
        }}
        onBlur={() => setIsEditing(false)}
        className="text-xs px-2 py-1 border border-blue-400 rounded outline-none bg-white"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="cursor-pointer text-left"
    >
      {value && (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${getCategoryStyle(value)}`}
        >
          {value}
        </Badge>
      )}
      {!value && (
        <span className="text-gray-300 text-xs hover:text-gray-500">
          選択...
        </span>
      )}
    </button>
  );
}

// 新規行コンポーネント
function NewWordRow({
  onSave,
  defaultLanguage,
}: {
  onSave: () => void;
  defaultLanguage: Language;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    pronunciation: "",
    category: "Noun" as Category,
    meaning: "",
    example: "",
    exampleTranslation: "",
    note: "",
  });

  const handleSave = async () => {
    if (!newWord.word.trim()) {
      setIsAdding(false);
      return;
    }

    setSaving(true);
    try {
      await createWord({
        ...newWord,
        language: defaultLanguage,
        check1: false,
        check2: false,
        check3: false,
      });

      setNewWord({
        word: "",
        pronunciation: "",
        category: "Noun",
        meaning: "",
        example: "",
        exampleTranslation: "",
        note: "",
      });
      setIsAdding(false);
      onSave();
    } catch (error) {
      console.error("Failed to save word:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdding) {
    return (
      <TableRow
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsAdding(true)}
      >
        <TableCell colSpan={9} className="py-3">
          <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600">
            <span className="w-5 h-5 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400">
              +
            </span>
            <span className="text-sm">新規</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-blue-50/50">
      <TableCell />
      <TableCell />
      <TableCell>
        <input
          type="text"
          value={newWord.word}
          onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
          placeholder="単語を入力..."
          disabled={saving}
          className="w-full px-2 py-1 text-sm border border-blue-400 rounded outline-none bg-white"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsAdding(false);
          }}
        />
      </TableCell>
      <TableCell>
        <input
          type="text"
          value={newWord.pronunciation}
          onChange={(e) =>
            setNewWord({ ...newWord, pronunciation: e.target.value })
          }
          placeholder="発音"
          disabled={saving}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none bg-white font-mono"
        />
      </TableCell>
      <TableCell>
        <select
          value={newWord.category}
          onChange={(e) =>
            setNewWord({ ...newWord, category: e.target.value as Category })
          }
          disabled={saving}
          className="text-xs px-2 py-1 border border-gray-200 rounded outline-none bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <input
          type="text"
          value={newWord.meaning}
          onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
          placeholder="意味"
          disabled={saving}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none bg-white"
        />
      </TableCell>
      <TableCell>
        <input
          type="text"
          value={newWord.example}
          onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
          placeholder="例文"
          disabled={saving}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none bg-white"
        />
      </TableCell>
      <TableCell>
        <input
          type="text"
          value={newWord.note}
          onChange={(e) => setNewWord({ ...newWord, note: e.target.value })}
          placeholder="メモ"
          disabled={saving}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded outline-none bg-white"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleSave}
            disabled={saving}
            className="text-emerald-500 hover:text-emerald-600"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsAdding(false)}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function VocabularyTable({
  words,
  filters,
  onFiltersChange,
  onEdit,
  onRefresh,
  onAddNew,
  defaultLanguage = "english",
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [localWords, setLocalWords] = useState(words);

  // 親からwordsが変わったらローカル状態を更新
  useEffect(() => {
    setLocalWords(words);
  }, [words]);

  // 列幅をローカルストレージから読み込み
  useEffect(() => {
    setColumnWidths(loadColumnWidths());
  }, []);

  // 列幅変更時に保存
  const handleColumnResize = useCallback(
    (column: keyof typeof DEFAULT_COLUMN_WIDTHS, width: number) => {
      setColumnWidths((prev) => {
        const newWidths = { ...prev, [column]: width };
        saveColumnWidths(newWidths);
        return newWidths;
      });
    },
    [],
  );

  // オプティミスティック更新：ローカル状態を即座に更新し、APIは非同期で実行
  const handleUpdateField = async (
    id: string,
    field: keyof VocabularyWordDB,
    value: string | boolean,
  ) => {
    // ローカル状態を即座に更新
    setLocalWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );

    // APIを非同期で実行（エラー時はリフレッシュ）
    try {
      await updateWordAPI(id, { [field]: value });
    } catch (error) {
      console.error("Failed to update word:", error);
      onRefresh(); // エラー時のみリフレッシュ
    }
  };

  const toggleCheck = async (word: VocabularyWordDB, checkNum: 1 | 2 | 3) => {
    const key = `check${checkNum}` as "check1" | "check2" | "check3";
    const newValue = !word[key];

    // ローカル状態を即座に更新
    setLocalWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, [key]: newValue } : w)),
    );

    try {
      await updateWordAPI(word.id, { [key]: newValue });
    } catch (error) {
      console.error("Failed to toggle check:", error);
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("この単語を削除しますか？")) {
      try {
        await deleteWordAPI(id);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete word:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`${selectedIds.size}件の単語を削除しますか？`)) {
      try {
        await deleteWordsAPI(Array.from(selectedIds));
        setSelectedIds(new Set());
        onRefresh();
      } catch (error) {
        console.error("Failed to delete words:", error);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === localWords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localWords.map((w) => w.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="w-full bg-white">
      {/* 一括操作バー */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {selectedIds.size}件選択中
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-4 h-4" />
            削除
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            選択解除
          </Button>
        </div>
      )}

      {/* Notion風テーブル（列幅リサイズ可能） */}
      <Table className="notion-table">
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead
              style={{ width: columnWidths.checkbox }}
              className="text-center"
            >
              <Checkbox
                checked={
                  selectedIds.size === localWords.length &&
                  localWords.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <ResizableHeader
              width={columnWidths.progress}
              onResize={(w) => handleColumnResize("progress", w)}
              className="text-center text-gray-500 text-xs font-medium"
            >
              進捗
            </ResizableHeader>
            <ResizableHeader
              width={columnWidths.word}
              onResize={(w) => handleColumnResize("word", w)}
              className="text-gray-500 text-xs font-medium"
            >
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                単語
              </div>
            </ResizableHeader>
            <ResizableHeader
              width={columnWidths.pronunciation}
              onResize={(w) => handleColumnResize("pronunciation", w)}
              className="text-gray-500 text-xs font-medium"
            >
              発音記号
            </ResizableHeader>
            <ResizableHeader
              width={columnWidths.category}
              onResize={(w) => handleColumnResize("category", w)}
              className="text-gray-500 text-xs font-medium"
            >
              分類
            </ResizableHeader>
            <ResizableHeader
              width={columnWidths.meaning}
              onResize={(w) => handleColumnResize("meaning", w)}
              className="text-gray-500 text-xs font-medium"
            >
              意味
            </ResizableHeader>
            <ResizableHeader
              width={columnWidths.example}
              onResize={(w) => handleColumnResize("example", w)}
              className="text-gray-500 text-xs font-medium"
            >
              例文
            </ResizableHeader>
            <ResizableHeader
              width={columnWidths.note}
              onResize={(w) => handleColumnResize("note", w)}
              className="text-gray-500 text-xs font-medium"
            >
              メモ
            </ResizableHeader>
            <TableHead style={{ width: columnWidths.actions }} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {localWords.map((word) => (
            <TableRow
              key={word.id}
              className={`hover:bg-gray-50 border-b border-gray-100 group ${
                selectedIds.has(word.id) ? "bg-blue-50" : ""
              }`}
            >
              <TableCell className="text-center">
                <Checkbox
                  checked={selectedIds.has(word.id)}
                  onCheckedChange={() => toggleSelect(word.id)}
                />
              </TableCell>

              {/* 3つのチェックボックス */}
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3].map((num) => {
                    const checked =
                      word[`check${num}` as "check1" | "check2" | "check3"];
                    return (
                      <button
                        key={num}
                        type="button"
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          checked
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => toggleCheck(word, num as 1 | 2 | 3)}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </TableCell>

              {/* 単語（インライン編集可能） */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => speak(word.word, word.language as Language)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="発音を聞く"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <EditableCell
                    value={word.word}
                    onChange={(v) => handleUpdateField(word.id, "word", v)}
                    placeholder="単語"
                    className="font-medium text-gray-900"
                  />
                </div>
              </TableCell>

              {/* 発音記号（インライン編集可能） */}
              <TableCell>
                <EditableCell
                  value={word.pronunciation}
                  onChange={(v) =>
                    handleUpdateField(word.id, "pronunciation", v)
                  }
                  placeholder="発音"
                  className="text-gray-500 font-mono text-sm"
                />
              </TableCell>

              {/* 分類（品詞）- カテゴリ選択 */}
              <TableCell>
                <CategoryCell
                  value={word.category}
                  onChange={(v) => handleUpdateField(word.id, "category", v)}
                />
              </TableCell>

              {/* 意味（インライン編集可能、省略表示） */}
              <TableCell>
                <EditableCell
                  value={word.meaning}
                  onChange={(v) => handleUpdateField(word.id, "meaning", v)}
                  placeholder="意味"
                  className="text-gray-700 text-sm line-clamp-2"
                />
              </TableCell>

              {/* 例文（単語ハイライト付き、インライン編集可能、翻訳切り替え付き） */}
              <TableCell className="text-gray-600 text-sm">
                <ExampleCell
                  word={word}
                  onUpdate={(field, value) =>
                    handleUpdateField(word.id, field, value)
                  }
                />
              </TableCell>

              {/* メモ（インライン編集可能） */}
              <TableCell>
                <EditableCell
                  value={word.note}
                  onChange={(v) => handleUpdateField(word.id, "note", v)}
                  placeholder="メモ"
                  className="text-gray-500 text-sm line-clamp-2"
                />
              </TableCell>

              {/* アクション */}
              <TableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(word.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* 新規追加行（Notion風） */}
          <NewWordRow onSave={onRefresh} defaultLanguage={defaultLanguage} />
        </TableBody>
      </Table>

      {localWords.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">
            上の「+ 新規」をクリックして最初の単語を追加しましょう
          </p>
        </div>
      )}
    </div>
  );
}
