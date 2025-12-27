"use client";

import { Loader2, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createWord, updateWordAPI, type VocabularyWordDB } from "@/lib/api";
import {
  CATEGORIES,
  type Category,
  getCategoriesForLanguage,
  LANGUAGES,
  type Language,
  WORD_SOURCES,
  type WordSource,
} from "@/types/vocabulary";

interface Props {
  word?: VocabularyWordDB | null;
  onClose: () => void;
  onSave: () => void;
  open: boolean;
  defaultLanguage?: Language;
}

export default function WordForm({
  word,
  onClose,
  onSave,
  open,
  defaultLanguage = "english",
}: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    word: "",
    pronunciation: "",
    category: "Noun" as Category | string,
    meaning: "",
    example: "",
    exampleTranslation: "",
    source: "" as WordSource,
    note: "",
    language: "english" as Language,
    check1: false,
    check2: false,
    check3: false,
  });

  // noteフィールドからsourceを抽出するヘルパー関数
  const parseNoteAndSource = (
    note: string
  ): { source: WordSource; note: string } => {
    // noteの先頭に[ソース名]の形式があるかチェック
    const sourceMatch = note.match(/^\[([^\]]+)\]\s*/);
    if (sourceMatch) {
      const sourceValue = sourceMatch[1];
      const isValidSource = WORD_SOURCES.some((s) => s.value === sourceValue);
      if (isValidSource) {
        return {
          source: sourceValue as WordSource,
          note: note.replace(sourceMatch[0], ""),
        };
      }
    }
    return { source: "", note };
  };

  useEffect(() => {
    if (word) {
      const { source, note } = parseNoteAndSource(word.note);
      setFormData({
        word: word.word,
        pronunciation: word.pronunciation,
        category: word.category,
        meaning: word.meaning,
        example: word.example,
        exampleTranslation: word.exampleTranslation || "",
        source,
        note,
        language: word.language as Language,
        check1: word.check1,
        check2: word.check2,
        check3: word.check3,
      });
    } else {
      setFormData({
        word: "",
        pronunciation: "",
        category: "Noun",
        meaning: "",
        example: "",
        exampleTranslation: "",
        source: "",
        note: "",
        language: defaultLanguage,
        check1: false,
        check2: false,
        check3: false,
      });
    }
  }, [word, defaultLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word.trim()) {
      alert("単語を入力してください");
      return;
    }

    // sourceとnoteを結合してnoteフィールドに保存
    const combinedNote = formData.source
      ? `[${formData.source}] ${formData.note}`.trim()
      : formData.note;

    const dataToSave = {
      ...formData,
      note: combinedNote,
    };

    setSaving(true);
    try {
      if (word) {
        await updateWordAPI(word.id, dataToSave);
      } else {
        await createWord(dataToSave);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save word:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            {word ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {word ? "単語を編集" : "新しい単語を追加"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto flex-1 pr-2"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* 言語 */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-gray-600">
                言語
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => {
                  const newLang = value as Language;
                  const newCategories = getCategoriesForLanguage(newLang);
                  setFormData((prev) => ({
                    ...prev,
                    language: newLang,
                    // 言語変更時に品詞をその言語のデフォルトに設定
                    category: newCategories[0] || "Noun",
                  }));
                }}
                disabled={saving}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="言語を選択" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 品詞 */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-600">
                品詞
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as Category,
                  }))
                }
                disabled={saving}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="品詞を選択" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoriesForLanguage(formData.language).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 単語 */}
          <div className="space-y-2">
            <Label htmlFor="word" className="text-gray-600">
              単語 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="word"
              value={formData.word}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, word: e.target.value }))
              }
              placeholder="例: ephemeral"
              required
              disabled={saving}
            />
          </div>

          {/* 発音記号 */}
          <div className="space-y-2">
            <Label htmlFor="pronunciation" className="text-gray-600">
              発音記号
            </Label>
            <Input
              id="pronunciation"
              value={formData.pronunciation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pronunciation: e.target.value,
                }))
              }
              placeholder="例: ɪˈfem(ə)rəl"
              className="font-mono"
              disabled={saving}
            />
          </div>

          {/* 意味 */}
          <div className="space-y-2">
            <Label htmlFor="meaning" className="text-gray-600">
              意味
            </Label>
            <Textarea
              id="meaning"
              value={formData.meaning}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meaning: e.target.value }))
              }
              placeholder="日本語での意味を入力"
              rows={2}
              disabled={saving}
            />
          </div>

          {/* 例文 */}
          <div className="space-y-2">
            <Label htmlFor="example" className="text-gray-600">
              例文
            </Label>
            <Textarea
              id="example"
              value={formData.example}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, example: e.target.value }))
              }
              placeholder="例文を入力"
              rows={2}
              disabled={saving}
            />
          </div>

          {/* 例文の日本語訳 */}
          <div className="space-y-2">
            <Label htmlFor="exampleTranslation" className="text-gray-600">
              例文の日本語訳
            </Label>
            <Textarea
              id="exampleTranslation"
              value={formData.exampleTranslation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  exampleTranslation: e.target.value,
                }))
              }
              placeholder="例文の日本語訳を入力（任意）"
              rows={2}
              disabled={saving}
            />
          </div>

          {/* 出典・メモ */}
          <div className="space-y-3">
            <Label className="text-gray-600">出典・メモ</Label>

            {/* ソース選択 */}
            <div className="flex items-center gap-3">
              <Select
                value={formData.source || "__none__"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    source: value === "__none__" ? "" : (value as WordSource),
                  }))
                }
                disabled={saving}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="出典を選択（任意）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">選択なし</SelectItem>
                  {/* ニュースソース */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                    📰 ニュースメディア
                  </div>
                  {WORD_SOURCES.filter((s) => s.category === "news").map(
                    (source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.icon} {source.label}
                      </SelectItem>
                    )
                  )}
                  {/* 試験ソース */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                    📚 試験・資格
                  </div>
                  {WORD_SOURCES.filter((s) => s.category === "exam").map(
                    (source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.icon} {source.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 自由記述メモ */}
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="覚え方のヒントなど（自由記述）"
              rows={2}
              disabled={saving}
            />
          </div>

          {/* 進捗チェック */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-600">
              進捗チェック
            </span>
            <div className="flex gap-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <Checkbox
                    id={`check${num}`}
                    checked={
                      formData[`check${num}` as "check1" | "check2" | "check3"]
                    }
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`check${num}`]: checked,
                      }))
                    }
                    disabled={saving}
                  />
                  <Label
                    htmlFor={`check${num}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Check {num}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter className="mt-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {word ? "更新" : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
