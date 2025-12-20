"use client";

import { Check, Edit3, Trash2, Volume2 } from "lucide-react";
import { useState } from "react";
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
import { deleteMultipleWords, deleteWord, updateWord } from "@/lib/storage";
import { speak } from "@/lib/tts";
import type { FilterOptions, VocabularyWord } from "@/types/vocabulary";

interface Props {
  words: VocabularyWord[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onEdit: (word: VocabularyWord) => void;
  onRefresh: () => void;
  onAddNew: () => void;
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
  if (!example || !word) return example;

  // 単語を様々な形で検索（大文字小文字無視、語形変化も考慮）
  const wordLower = word.toLowerCase();
  const regex = new RegExp(
    `\\b(${word}|${wordLower}|${word}s|${word}ed|${word}ing|${word}d)\\b`,
    "gi",
  );

  const parts = example.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase().startsWith(wordLower.substring(0, 3))) {
      return (
        <span key={index} className="text-red-500 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
};

export default function VocabularyTable({
  words,
  filters,
  onFiltersChange,
  onEdit,
  onRefresh,
  onAddNew,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [_expandedId, _setExpandedId] = useState<string | null>(null);

  const toggleCheck = (word: VocabularyWord, checkNum: 1 | 2 | 3) => {
    const key = `check${checkNum}` as "check1" | "check2" | "check3";
    updateWord(word.id, { [key]: !word[key] });
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm("この単語を削除しますか？")) {
      deleteWord(id);
      onRefresh();
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`${selectedIds.size}件の単語を削除しますか？`)) {
      deleteMultipleWords(Array.from(selectedIds));
      setSelectedIds(new Set());
      onRefresh();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === words.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(words.map((w) => w.id)));
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

      {/* Notion風テーブル */}
      <Table className="notion-table">
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="w-10 text-center">
              <Checkbox
                checked={selectedIds.size === words.length && words.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-24 text-center text-gray-500 text-xs font-medium">
              進捗
            </TableHead>
            <TableHead className="text-gray-500 text-xs font-medium">
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                単語
              </div>
            </TableHead>
            <TableHead className="text-gray-500 text-xs font-medium">
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                発音記号
              </div>
            </TableHead>
            <TableHead className="text-gray-500 text-xs font-medium">
              分類
            </TableHead>
            <TableHead className="text-gray-500 text-xs font-medium">
              意味
            </TableHead>
            <TableHead className="text-gray-500 text-xs font-medium min-w-[300px]">
              例文
            </TableHead>
            <TableHead className="text-gray-500 text-xs font-medium">
              メモ
            </TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow
              key={word.id}
              className={`hover:bg-gray-50 border-b border-gray-100 ${
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

              {/* 単語 */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speak(word.word, word.language)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="発音を聞く"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-gray-900">{word.word}</span>
                </div>
              </TableCell>

              {/* 発音記号 */}
              <TableCell className="text-gray-500 font-mono text-sm">
                {word.pronunciation || "-"}
              </TableCell>

              {/* 分類（品詞）- カラフルバッジ */}
              <TableCell>
                {word.category && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getCategoryStyle(word.category)}`}
                  >
                    {word.category}
                  </Badge>
                )}
              </TableCell>

              {/* 意味 */}
              <TableCell className="text-gray-700">{word.meaning}</TableCell>

              {/* 例文（単語ハイライト付き） */}
              <TableCell className="text-gray-600 text-sm">
                {highlightWord(word.example, word.word)}
              </TableCell>

              {/* メモ */}
              <TableCell className="text-gray-500 text-sm">
                {word.note || "-"}
              </TableCell>

              {/* アクション */}
              <TableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(word)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
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
        </TableBody>
      </Table>

      {/* Notion風 新規追加行 */}
      <button
        type="button"
        onClick={onAddNew}
        className="w-full flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100 group"
      >
        <span className="w-5 h-5 flex items-center justify-center rounded border border-dashed border-gray-300 group-hover:border-gray-400 text-gray-400 group-hover:text-gray-500">
          +
        </span>
        <span className="text-sm">新規</span>
      </button>

      {words.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">
            上の「+ 新規」をクリックして最初の単語を追加しましょう
          </p>
        </div>
      )}
    </div>
  );
}
