// CSVインポート/エクスポートユーティリティ

import type { Language, VocabularyWord } from "@/types/vocabulary";
import { generateId } from "./storage";

// CSVをパース（カンマ、改行、引用符対応）
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        if (char === "\r") i++;
      } else if (char !== "\r") {
        currentCell += char;
      }
    }
  }

  // 最後のセルと行を追加
  currentRow.push(currentCell.trim());
  if (currentRow.some((cell) => cell !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

// Notionからエクスポートされた既存のCSV形式を読み込む
export function importFromNotionCSV(csvText: string): VocabularyWord[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const words: VocabularyWord[] = [];

  // ヘッダーのインデックスを取得
  const getIndex = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex((h) => h.includes(name));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const englishIdx = getIndex(["english", "word", "単語"]);
  const categoryIdx = getIndex(["category", "pos", "品詞"]);
  const check1Idx = getIndex(["check 1", "check1"]);
  const check2Idx = getIndex(["check 2", "check2"]);
  const check3Idx = getIndex(["check 3", "check3"]);
  const createdIdx = getIndex(["created", "created time", "作成日"]);
  const exampleIdx = getIndex(["example", "例文"]);
  const exampleTranslationIdx = getIndex([
    "example translation",
    "exampletranslation",
    "例文訳",
    "例文の日本語訳",
  ]);
  const japaneseIdx = getIndex(["japanese", "meaning", "意味", "日本語"]);
  const noteIdx = getIndex(["note", "notes", "メモ"]);
  const pronunciationIdx = getIndex(["pronunciation", "発音", "発音記号"]);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[englishIdx]) continue;

    const word: VocabularyWord = {
      id: generateId(),
      word: row[englishIdx] || "",
      pronunciation: pronunciationIdx >= 0 ? row[pronunciationIdx] || "" : "",
      category: categoryIdx >= 0 ? row[categoryIdx] || "Other" : "Other",
      meaning: japaneseIdx >= 0 ? row[japaneseIdx] || "" : "",
      example: exampleIdx >= 0 ? row[exampleIdx] || "" : "",
      exampleTranslation:
        exampleTranslationIdx >= 0 ? row[exampleTranslationIdx] || "" : "",
      note: noteIdx >= 0 ? row[noteIdx] || "" : "",
      language: "english" as Language,
      check1: check1Idx >= 0 ? row[check1Idx]?.toLowerCase() === "yes" : false,
      check2: check2Idx >= 0 ? row[check2Idx]?.toLowerCase() === "yes" : false,
      check3: check3Idx >= 0 ? row[check3Idx]?.toLowerCase() === "yes" : false,
      createdAt:
        createdIdx >= 0 && row[createdIdx]
          ? parseNotionDate(row[createdIdx])
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    words.push(word);
  }

  return words;
}

// Notionの日付形式をISOに変換
function parseNotionDate(dateStr: string): string {
  try {
    // "December 13, 2023 11:51 PM" 形式をパース
    const date = new Date(dateStr);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // パース失敗時は現在時刻を返す
  }
  return new Date().toISOString();
}

// CSVエクスポート
export function exportToCSV(words: VocabularyWord[]): string {
  const headers = [
    "Word",
    "Pronunciation",
    "Category",
    "Meaning",
    "Example",
    "Example Translation",
    "Note",
    "Language",
    "Check 1",
    "Check 2",
    "Check 3",
    "Created At",
    "Updated At",
  ];

  const escapeCSV = (str: string): string => {
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = words.map((word) => [
    escapeCSV(word.word),
    escapeCSV(word.pronunciation),
    escapeCSV(word.category),
    escapeCSV(word.meaning),
    escapeCSV(word.example),
    escapeCSV(word.exampleTranslation || ""),
    escapeCSV(word.note),
    word.language,
    word.check1 ? "Yes" : "No",
    word.check2 ? "Yes" : "No",
    word.check3 ? "Yes" : "No",
    word.createdAt,
    word.updatedAt,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

// ファイルダウンロード
export function downloadCSV(
  words: VocabularyWord[],
  filename = "vocabulary.csv",
): void {
  const csv = exportToCSV(words);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
