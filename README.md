# Polyglot Vocab - 多言語単語帳

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Hono-4.x-orange?logo=hono" alt="Hono" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?logo=tailwind-css" alt="Tailwind CSS" />
</div>

## 🌍 概要

Polyglot Vocabは、英語・スペイン語・韓国語・中国語に対応した多言語単語帳Webアプリです。
Notion風のリッチなUIで、効率的に単語を管理・学習できます。

## ✨ 機能

- **📚 単語管理 (CRUD)**
  - 単語の追加・編集・削除
  - 発音記号・品詞・意味・例文・メモの記録
  - 多言語対応（英語、スペイン語、韓国語、中国語）

- **✅ 暗記チェック**
  - 3段階の進捗チェック
  - 習得済み / 学習中 / 未学習のステータス管理

- **🃏 フラッシュカード学習**
  - カードをめくって単語を学習
  - シャッフル機能
  - キーボードショートカット対応

- **🔍 検索・フィルタリング**
  - 単語・意味・例文で検索
  - 言語・品詞・ステータスでフィルタリング
  - ソート機能

- **📊 統計・進捗管理**
  - 学習進捗の可視化
  - 言語別・品詞別の統計

- **📥 CSVインポート/エクスポート**
  - Notionからエクスポートした単語帳をインポート可能
  - データのバックアップとエクスポート

- **🔊 音声読み上げ (TTS)**
  - Web Speech APIによる発音確認
  - 多言語対応

## 🚀 セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/polyglot-vocab.git
cd polyglot-vocab

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

ブラウザで http://localhost:3000 を開きます。

## 📦 ビルド

```bash
# プロダクションビルド
pnpm build

# プロダクションサーバーを起動
pnpm start
```

## 📁 プロジェクト構造

```
polyglot-vocab/
├── src/
│   ├── app/
│   │   ├── api/[[...route]]/  # Hono バックエンドAPI
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── layout.tsx          # レイアウト
│   │   └── page.tsx            # メインページ
│   ├── components/
│   │   ├── CSVImport.tsx       # CSVインポート
│   │   ├── FlashCard.tsx       # フラッシュカード
│   │   ├── SearchFilter.tsx    # 検索・フィルター
│   │   ├── Statistics.tsx      # 統計
│   │   ├── VocabularyTable.tsx # 単語テーブル
│   │   └── WordForm.tsx        # 単語フォーム
│   ├── lib/
│   │   ├── csv.ts              # CSV処理
│   │   ├── storage.ts          # ローカルストレージ
│   │   └── tts.ts              # 音声読み上げ
│   └── types/
│       └── vocabulary.ts       # 型定義
├── package.json
└── README.md
```

## 📋 CSVフォーマット

Notionからエクスポートした以下のフォーマットに対応：

| ヘッダー | 説明 |
|----------|------|
| English | 単語 |
| Pronunciation | 発音記号 |
| Category | 品詞 |
| Japanese | 日本語の意味 |
| Example | 例文 |
| Note | メモ |
| Check 1/2/3 | 進捗チェック (Yes/No) |
| Created time | 作成日時 |

## ⌨️ キーボードショートカット

フラッシュカードモードで使用可能：

| キー | アクション |
|------|------------|
| Space / Enter | カードを裏返す |
| ← | まだ覚えていない |
| → | 覚えた |
| ↑ | 前の単語 |
| ↓ | 次の単語 |
| S | 発音を聞く |

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + React 19
- **バックエンドAPI**: Hono
- **スタイリング**: Tailwind CSS 4
- **アイコン**: Lucide React
- **データ保存**: localStorage（将来的にクラウド対応予定）
- **音声**: Web Speech API

## 📄 ライセンス

MIT License

## 🙏 謝辞

このプロジェクトはNotionの単語帳からの移行を目的として作成されました。
