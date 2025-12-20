"use client";

import { AlertCircle, Check, FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { importFromNotionCSV } from "@/lib/csv";
import { importWords } from "@/lib/storage";

interface Props {
  onImport: () => void;
  onClose: () => void;
  open: boolean;
}

export default function CSVImport({ onImport, onClose, open }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setStatus("error");
      setMessage("CSVファイルを選択してください");
      return;
    }

    setStatus("loading");
    setMessage("ファイルを読み込み中...");

    try {
      const text = await file.text();
      const words = importFromNotionCSV(text);

      if (words.length === 0) {
        setStatus("error");
        setMessage("有効な単語が見つかりませんでした");
        return;
      }

      const importedCount = importWords(words);
      setStatus("success");
      setMessage(`${importedCount}件の新しい単語をインポートしました`);

      setTimeout(() => {
        onImport();
        onClose();
        setStatus("idle");
      }, 1500);
    } catch (error) {
      setStatus("error");
      setMessage("ファイルの読み込みに失敗しました");
      console.error(error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setStatus("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CSVインポート
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {status === "idle" && (
              <>
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="mb-2">CSVファイルをドラッグ＆ドロップ</p>
                <p className="text-sm text-muted-foreground">
                  または<span className="text-primary">クリック</span>
                  して選択
                </p>
              </>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p>{message}</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-destructive">{message}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatus("idle")}
                  className="mt-4"
                >
                  もう一度試す
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted rounded-xl">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              対応フォーマット
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Notionからエクスポートした単語帳CSV</li>
              <li>
                • ヘッダー行: English, Category, Check 1-3, Japanese, Example,
                Note, Pronunciation
              </li>
              <li>• 既存の単語と重複する場合はスキップされます</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
