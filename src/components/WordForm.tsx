"use client";

import { Plus, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addWord, updateWord } from "@/lib/storage";
import {
  CATEGORIES,
  type Category,
  LANGUAGES,
  type Language,
  type VocabularyWord,
} from "@/types/vocabulary";

interface Props {
  word?: VocabularyWord | null;
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
  const [formData, setFormData] = useState({
    word: "",
    pronunciation: "",
    category: "Noun" as Category | string,
    meaning: "",
    example: "",
    note: "",
    language: "english" as Language,
    check1: false,
    check2: false,
    check3: false,
  });

  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word,
        pronunciation: word.pronunciation,
        category: word.category,
        meaning: word.meaning,
        example: word.example,
        note: word.note,
        language: word.language,
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
        note: "",
        language: defaultLanguage,
        check1: false,
        check2: false,
        check3: false,
      });
    }
  }, [word, defaultLanguage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word.trim()) {
      alert("単語を入力してください");
      return;
    }

    if (word) {
      updateWord(word.id, formData);
    } else {
      addWord(formData);
    }

    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
              <label className="text-sm font-medium text-muted-foreground">
                言語
              </label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    language: value as Language,
                  }))
                }
              >
                <SelectTrigger className="w-full">
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
              <label className="text-sm font-medium text-muted-foreground">
                品詞
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as Category,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="品詞を選択" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
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
            <label className="text-sm font-medium text-muted-foreground">
              単語 <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.word}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, word: e.target.value }))
              }
              placeholder="例: ephemeral"
              required
            />
          </div>

          {/* 発音記号 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              発音記号
            </label>
            <Input
              value={formData.pronunciation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pronunciation: e.target.value,
                }))
              }
              placeholder="例: ɪˈfem(ə)rəl"
              className="font-mono"
            />
          </div>

          {/* 意味 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              意味
            </label>
            <Textarea
              value={formData.meaning}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meaning: e.target.value }))
              }
              placeholder="日本語での意味を入力"
              rows={2}
            />
          </div>

          {/* 例文 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              例文
            </label>
            <Textarea
              value={formData.example}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, example: e.target.value }))
              }
              placeholder="例文を入力"
              rows={2}
            />
          </div>

          {/* メモ */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              メモ
            </label>
            <Textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="覚え方のヒントなど"
              rows={2}
            />
          </div>

          {/* 進捗チェック */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              進捗チェック
            </label>
            <div className="flex gap-6">
              {[1, 2, 3].map((num) => (
                <label
                  key={num}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={
                      formData[`check${num}` as "check1" | "check2" | "check3"]
                    }
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`check${num}`]: checked,
                      }))
                    }
                  />
                  <span className="text-sm">Check {num}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4" />
            {word ? "更新" : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
