"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DraggableAttributes,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  GripVertical,
  Languages,
  Plus,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  reorderWordsAPI,
  updateWordAPI,
  type VocabularyWordDB,
} from "@/lib/api";
import { speak } from "@/lib/tts";
import {
  CATEGORIES,
  type Category,
  type FilterOptions,
  type Language,
  WORD_SOURCES,
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
  rowActions: 70, // ドラッグ、追加、削除をまとめた列
  word: 140,
  pronunciation: 100,
  category: 90,
  meaning: 150,
  example: 240,
  note: 130, // ソース表示用
  createdAt: 140, // 追加日（年月日時分秒表示用）
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
    [width]
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

// メモからソース（出典）を抽出
const parseNoteSource = (note: string): { source: string; text: string } => {
  const sourceMatch = note.match(/^\[([^\]]+)\]\s*/);
  if (sourceMatch) {
    const sourceValue = sourceMatch[1];
    const isValidSource = WORD_SOURCES.some((s) => s.value === sourceValue);
    if (isValidSource) {
      return {
        source: sourceValue,
        text: note.replace(sourceMatch[0], ""),
      };
    }
  }
  return { source: "", text: note };
};

// 日付をフォーマット（年月日 時:分:秒）
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

// ソースごとのスタイル
const getSourceStyle = (source: string) => {
  const styles: Record<string, string> = {
    英検準1級: "bg-green-100 text-green-700",
    英検1級: "bg-emerald-100 text-emerald-700",
    "The New York Times": "bg-slate-100 text-slate-700",
    BBC: "bg-red-100 text-red-700",
    CNN: "bg-red-100 text-red-700",
    "The Economist": "bg-rose-100 text-rose-700",
    TOEFL: "bg-blue-100 text-blue-700",
    TOEIC: "bg-amber-100 text-amber-700",
    GRE: "bg-purple-100 text-purple-700",
    SAT: "bg-indigo-100 text-indigo-700",
  };
  return styles[source] || "bg-gray-100 text-gray-600";
};

// 例文内の単語をハイライト
const highlightWord = (example: string, word: string) => {
  if (!example || !word) return example || "-";

  const wordLower = word.toLowerCase();
  const regex = new RegExp(
    `\\b(${word}|${wordLower}|${word}s|${word}ed|${word}ing|${word}d)\\b`,
    "gi"
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
      className={`px-2 py-1 rounded cursor-text hover:bg-gray-100 min-h-[28px] text-left w-full overflow-hidden ${className} ${
        !value ? "text-gray-300" : ""
      }`}
    >
      <span className="block overflow-hidden text-ellipsis">
        {value || placeholder || "-"}
      </span>
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
    "example"
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
        className={`shrink-0 p-1 rounded transition-colors ${
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

// 行アクションボタン（メモ化）
const RowActions = memo(function RowActions({
  onAddBelow,
  onDelete,
  dragAttributes,
  dragListeners,
}: {
  onAddBelow: () => void;
  onDelete: () => void;
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
}) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {/* ドラッグハンドル */}
      <div
        className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"
        {...dragAttributes}
        {...dragListeners}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {/* 下に追加 */}
      <button
        type="button"
        onClick={onAddBelow}
        className="p-1 text-gray-300 hover:text-blue-500 transition-colors"
        title="下に行を追加"
      >
        <Plus className="w-4 h-4" />
      </button>
      {/* 削除 */}
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
        title="削除"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
});

// ドラッグ可能な行コンポーネント（メモ化）
const SortableRow = memo(function SortableRow({
  word,
  columnWidths,
  onUpdateField,
  onDelete,
  onAddBelow,
}: {
  word: VocabularyWordDB;
  columnWidths: typeof DEFAULT_COLUMN_WIDTHS;
  onUpdateField: (
    field: keyof VocabularyWordDB,
    value: string | boolean
  ) => void;
  onDelete: () => void;
  onAddBelow: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: word.id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : undefined,
    }),
    [transform, transition, isDragging]
  );

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 border-b border-gray-100 group ${
        isDragging ? "bg-gray-100 shadow-lg" : ""
      }`}
    >
      {/* 行アクション: ドラッグ、追加、選択、削除 */}
      <TableCell
        className="p-1"
        style={{
          width: columnWidths.rowActions,
          maxWidth: columnWidths.rowActions,
        }}
      >
        <RowActions
          onAddBelow={onAddBelow}
          onDelete={onDelete}
          dragAttributes={attributes}
          dragListeners={listeners}
        />
      </TableCell>

      {/* 単語（インライン編集可能） */}
      <TableCell
        style={{ width: columnWidths.word, maxWidth: columnWidths.word }}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <button
            type="button"
            onClick={() => speak(word.word, word.language as Language)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="発音を聞く"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <EditableCell
            value={word.word}
            onChange={(v) => onUpdateField("word", v)}
            placeholder="単語"
            className="font-medium text-gray-900"
          />
        </div>
      </TableCell>

      {/* 発音記号（インライン編集可能） */}
      <TableCell
        style={{
          width: columnWidths.pronunciation,
          maxWidth: columnWidths.pronunciation,
        }}
      >
        <EditableCell
          value={word.pronunciation}
          onChange={(v) => onUpdateField("pronunciation", v)}
          placeholder="発音"
          className="text-gray-500 font-mono text-sm"
        />
      </TableCell>

      {/* 分類（品詞）- カテゴリ選択 */}
      <TableCell
        style={{
          width: columnWidths.category,
          maxWidth: columnWidths.category,
        }}
      >
        <CategoryCell
          value={word.category}
          onChange={(v) => onUpdateField("category", v)}
        />
      </TableCell>

      {/* 意味（インライン編集可能、省略表示） */}
      <TableCell
        style={{ width: columnWidths.meaning, maxWidth: columnWidths.meaning }}
      >
        <EditableCell
          value={word.meaning}
          onChange={(v) => onUpdateField("meaning", v)}
          placeholder="意味"
          className="text-gray-700 text-sm line-clamp-2"
        />
      </TableCell>

      {/* 例文（単語ハイライト付き、インライン編集可能、翻訳切り替え付き） */}
      <TableCell
        className="text-gray-600 text-sm"
        style={{ width: columnWidths.example, maxWidth: columnWidths.example }}
      >
        <ExampleCell
          word={word}
          onUpdate={(field, value) => onUpdateField(field, value)}
        />
      </TableCell>

      {/* メモ・出典 */}
      <TableCell
        style={{ width: columnWidths.note, maxWidth: columnWidths.note }}
      >
        <div className="space-y-1">
          {/* 出典バッジ */}
          {parseNoteSource(word.note).source && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getSourceStyle(
                parseNoteSource(word.note).source
              )}`}
            >
              {parseNoteSource(word.note).source}
            </span>
          )}
          {/* メモテキスト（インライン編集可能） */}
          <EditableCell
            value={parseNoteSource(word.note).text}
            onChange={(v) => {
              const { source } = parseNoteSource(word.note);
              const newNote = source ? `[${source}] ${v}`.trim() : v;
              onUpdateField("note", newNote);
            }}
            placeholder="メモ"
            className="text-gray-500 text-xs line-clamp-2"
          />
        </div>
      </TableCell>

      {/* 追加日 */}
      <TableCell
        style={{
          width: columnWidths.createdAt,
          maxWidth: columnWidths.createdAt,
        }}
      >
        <span className="text-xs text-gray-400">
          {formatDate(word.createdAt)}
        </span>
      </TableCell>
    </TableRow>
  );
});

// 行ごとのコールバックをメモ化するラッパー
const SortableRowWrapper = memo(function SortableRowWrapper({
  word,
  columnWidths,
  onUpdateField,
  onDelete,
  onAddBelow,
}: {
  word: VocabularyWordDB;
  columnWidths: typeof DEFAULT_COLUMN_WIDTHS;
  onUpdateField: (
    id: string,
    field: keyof VocabularyWordDB,
    value: string | boolean
  ) => void;
  onDelete: (id: string) => void;
  onAddBelow: (afterId: string) => void;
}) {
  // 各行ごとのコールバックをメモ化
  const handleUpdateField = useCallback(
    (field: keyof VocabularyWordDB, value: string | boolean) => {
      onUpdateField(word.id, field, value);
    },
    [onUpdateField, word.id]
  );

  const handleDelete = useCallback(() => {
    onDelete(word.id);
  }, [onDelete, word.id]);

  const handleAddBelow = useCallback(() => {
    onAddBelow(word.id);
  }, [onAddBelow, word.id]);

  return (
    <SortableRow
      word={word}
      columnWidths={columnWidths}
      onUpdateField={handleUpdateField}
      onDelete={handleDelete}
      onAddBelow={handleAddBelow}
    />
  );
});

// 新規行コンポーネント（Notion風：フォーカスを外したら自動保存）
function NewWordRow({
  onSave,
  defaultLanguage,
}: {
  onSave: () => void;
  defaultLanguage: Language;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [newWord, setNewWord] = useState({
    word: "",
    pronunciation: "",
    category: "Noun" as Category,
    meaning: "",
    example: "",
    exampleTranslation: "",
    note: "",
  });

  const handleSave = useCallback(async () => {
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
  }, [newWord, defaultLanguage, onSave]);

  // 行外をクリックしたら保存
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // フォーカスが行内の別の要素に移動した場合は保存しない
      if (rowRef.current?.contains(e.relatedTarget as Node)) {
        return;
      }
      // 少し遅延させて保存（selectのonChangeが先に処理されるように）
      setTimeout(() => {
        handleSave();
      }, 100);
    },
    [handleSave]
  );

  if (!isAdding) {
    return (
      <TableRow
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsAdding(true)}
      >
        <TableCell colSpan={8} className="py-3">
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
    <TableRow ref={rowRef} className="bg-blue-50/50" onBlur={handleBlur}>
      <TableCell />
      <TableCell>
        <input
          type="text"
          value={newWord.word}
          onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
          placeholder="単語を入力..."
          disabled={saving}
          autoFocus
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
      {/* 追加日（新規追加時は空） */}
      <TableCell>
        <span className="text-xs text-gray-400">-</span>
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
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [localWords, setLocalWords] = useState(words);

  // ドラッグ＆ドロップ用のセンサー（距離を小さくしてより敏感に）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    []
  );

  // オプティミスティック更新：ローカル状態を即座に更新し、APIは非同期で実行
  const handleUpdateField = async (
    id: string,
    field: keyof VocabularyWordDB,
    value: string | boolean
  ) => {
    // ローカル状態を即座に更新
    setLocalWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );

    // APIを非同期で実行（エラー時はリフレッシュ）
    try {
      await updateWordAPI(id, { [field]: value });
    } catch (error) {
      console.error("Failed to update word:", error);
      onRefresh(); // エラー時のみリフレッシュ
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("この単語を削除しますか？")) {
        // オプティミスティック更新：ローカル状態から即座に削除
        setLocalWords((prev) => prev.filter((w) => w.id !== id));

        try {
          await deleteWordAPI(id);
        } catch (error) {
          console.error("Failed to delete word:", error);
          // エラー時のみリフレッシュ
          onRefresh();
        }
      }
    },
    [onRefresh]
  );

  // ドラッグ終了時のハンドラ
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localWords.findIndex((w) => w.id === active.id);
      const newIndex = localWords.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // ローカル状態を即座に更新
        const newWords = [...localWords];
        const [movedWord] = newWords.splice(oldIndex, 1);
        newWords.splice(newIndex, 0, movedWord);
        setLocalWords(newWords);

        // APIで順序を保存
        try {
          await reorderWordsAPI(newWords.map((w) => w.id));
        } catch (error) {
          console.error("Failed to reorder words:", error);
          // エラー時は元に戻す
          onRefresh();
        }
      }
    }
  };

  // ソート可能なアイテムIDリスト（メモ化）
  const sortableItems = useMemo(
    () => localWords.map((w) => w.id),
    [localWords]
  );

  // 指定した行の下に新しい行を追加
  const handleAddBelow = useCallback(
    async (afterId: string) => {
      try {
        const newWord = await createWord({
          word: "",
          pronunciation: "",
          category: "Noun",
          meaning: "",
          example: "",
          exampleTranslation: "",
          note: "",
          language: defaultLanguage,
          check1: false,
          check2: false,
          check3: false,
        });

        // 現在の状態を取得して新しい順序を計算
        const idx = localWords.findIndex((w) => w.id === afterId);
        const newWords = [...localWords];
        if (idx === -1) {
          newWords.push(newWord);
        } else {
          newWords.splice(idx + 1, 0, newWord);
        }

        // ローカル状態を更新
        setLocalWords(newWords);

        // 順序をAPIに保存
        await reorderWordsAPI(newWords.map((w) => w.id));
      } catch (error) {
        console.error("Failed to add word:", error);
        onRefresh();
      }
    },
    [defaultLanguage, localWords, onRefresh]
  );

  return (
    <div className="w-full bg-white">
      {/* Notion風テーブル（列幅リサイズ可能、ドラッグ＆ドロップ対応） */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <Table
          className="notion-table"
          style={{
            width: Object.values(columnWidths).reduce((a, b) => a + b, 0),
            minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0),
          }}
        >
          {/* 列幅を明示的に設定 */}
          <colgroup>
            <col style={{ width: columnWidths.rowActions }} />
            <col style={{ width: columnWidths.word }} />
            <col style={{ width: columnWidths.pronunciation }} />
            <col style={{ width: columnWidths.category }} />
            <col style={{ width: columnWidths.meaning }} />
            <col style={{ width: columnWidths.example }} />
            <col style={{ width: columnWidths.note }} />
            <col style={{ width: columnWidths.createdAt }} />
          </colgroup>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead
                style={{ width: columnWidths.rowActions }}
                className="text-center text-gray-500 text-xs font-medium"
              />
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
                出典・メモ
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.createdAt}
                onResize={(w) => handleColumnResize("createdAt", w)}
                className="text-gray-500 text-xs font-medium"
              >
                追加日
              </ResizableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              {localWords.map((word) => (
                <SortableRowWrapper
                  key={word.id}
                  word={word}
                  columnWidths={columnWidths}
                  onUpdateField={handleUpdateField}
                  onDelete={handleDelete}
                  onAddBelow={handleAddBelow}
                />
              ))}
            </SortableContext>

            {/* 新規追加行（Notion風） */}
            <NewWordRow onSave={onRefresh} defaultLanguage={defaultLanguage} />
          </TableBody>
        </Table>
      </DndContext>

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
