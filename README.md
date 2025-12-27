# NewsLingua - ニュースで学ぶ語学プラットフォーム

<div align="center">
  <h3>📰 生きた言語を、生きたニュースから学ぶ</h3>
  
  <img src="https://img.shields.io/badge/Next.js-16.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Hono-4.x-orange?logo=hono" alt="Hono" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter" alt="Flutter" />
</div>

---

## 🌍 概要

**NewsLingua**は、世界中のニュースを読みながら語学力を向上させる次世代プラットフォームです。
AI駆動のパーソナライズ学習と、BBC・CNN・NHK World等のリアルニュースで、実践的な語学力を身につけます。

### 🎯 コンセプト

教科書の例文ではなく、**今日起きている出来事**を題材に語学を学ぶことで、実践的で記憶に残る学習体験を提供します。

---

## ✨ 機能

### 📰 ニュース学習
- **リアルタイムニュース** - BBC, CNN, NHK World等の最新記事
- **レベル別記事推薦** - CEFRレベルに応じた記事フィルタリング
- **インタラクティブリーディング** - 単語タップで即座にAI解説

### 🎯 レベル判定
- **初回診断テスト** - 語彙・読解の2軸でCEFRレベル判定
- **アダプティブテスト** - 回答に応じて難易度が変化
- **継続的レベル更新** - 学習進捗に応じたレベル調整

### 🤖 AI学習アシスタント
- **単語解説** - 文脈に応じた詳細な説明
- **例文生成** - レベルに合わせた自然な例文
- **文法サポート** - 記事内の文法ポイント解説

### 📚 単語管理
- 単語の追加・編集・削除
- 発音記号・品詞・意味・例文・メモの記録
- 多言語対応（英語、スペイン語、韓国語、中国語、フランス語、ドイツ語）

### 🃏 学習ツール
- **フラッシュカード** - スワイプ学習
- **復習リマインダー** - 忘却曲線に基づく通知
- **進捗統計** - 学習データの可視化

### 🏆 ゲーミフィケーション
- **ストリーク** - 連続学習日数のトラッキング
- **XP & レベル** - 学習活動に応じた経験値とレベルアップ
- **バッジ & 実績** - 目標達成で獲得できるバッジ
- **リーダーボード** - ユーザーランキング

### 💳 サブスクリプション
- **Stripe決済** - クレジットカード・デビットカード対応
- **3つのプラン** - Free / Pro (¥980/月) / Business (¥4,980/月)
- **カスタマーポータル** - 自分で請求管理

### 🛡️ 管理者機能
- **ダッシュボード** - ユーザー統計・アクティビティ
- **ユーザー管理** - 一覧・検索・詳細表示

---

## 🚀 セットアップ

### 前提条件

- Node.js 20+
- pnpm 9+
- Flutter 3.x（モバイルアプリ開発用）
- Neonアカウント（PostgreSQL）

### Web版インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/news-lingua.git
cd news-lingua

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.example .env
# .envを編集してNeon接続文字列を設定

# データベースをセットアップ
pnpm prisma generate
pnpm prisma migrate dev --name init

# 開発サーバーを起動
pnpm dev
```

ブラウザで http://localhost:3000 を開きます。

### モバイルアプリ（Flutter）セットアップ

```bash
# Flutterをインストール（まだの場合）
brew install --cask flutter

# Flutterの設定確認
flutter doctor

# モバイルディレクトリに移動
cd mobile

# 依存関係をインストール
flutter pub get

# Chrome（Web）で起動
flutter run -d chrome

# またはiOSシミュレータで起動
flutter run -d ios

# またはAndroidエミュレータで起動
flutter run -d android
```

### 開発時の起動手順

```bash
# ターミナル1: Web版（API）を起動
cd /path/to/news-lingua
pnpm dev

# ターミナル2: モバイルアプリを起動
cd /path/to/news-lingua/mobile
flutter run -d chrome
```

---

## 🧹 開発コマンド

### Biome（リント・フォーマット）

```bash
# リントを実行
pnpm lint

# リントを実行＆自動修正
pnpm lint:fix

# フォーマットを実行
pnpm format

# リント＆フォーマットを同時にチェック
pnpm check

# リント＆フォーマットを自動修正
pnpm check:fix
```

### その他

```bash
# 開発サーバーを起動
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバーを起動
pnpm start
```

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS 4** + Radix UI
- **Flutter** (モバイルアプリ)

### バックエンド
- **Next.js API Routes** + **Better Auth** (認証)
- **Prisma ORM** + **Neon PostgreSQL**
- **Stripe** (決済)
- **Python**: FastAPI (AI), MCP Server

### インフラ（コスト最適化: $0/月〜）
- **Vercel** - Next.jsホスティング
- **Neon PostgreSQL** + pgvector - データベース＆ベクトル検索
- **Upstash Redis** - セッション・キャッシュ
- **Cloudflare R2** - ストレージ
- **Render.com** - Python AIサービス

---

## 📁 プロジェクト構造

```
news-lingua/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # APIエンドポイント
│   │   ├── (auth)/             # 認証ページ
│   │   └── (main)/             # メインアプリ
│   ├── components/             # UIコンポーネント
│   ├── lib/                    # ユーティリティ
│   └── types/                  # 型定義
├── python-ai-service/          # Python AIサービス
│   ├── app/
│   │   ├── api/                # FastAPIエンドポイント
│   │   ├── services/           # AI/LLMサービス
│   │   └── mcp/                # MCPサーバー
│   └── pyproject.toml
├── prisma/
│   └── schema.prisma           # DBスキーマ
├── docs/                       # ドキュメント
│   ├── PRD.md                  # 製品要件定義
│   ├── ARCHITECTURE.md         # アーキテクチャ
│   └── ...
└── package.json
```

---

## 📋 ドキュメント

詳細なドキュメントは [`docs/`](./docs/) ディレクトリを参照してください：

- [PRD.md](./docs/PRD.md) - プロダクト要件定義
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - 技術アーキテクチャ
- [ROADMAP.md](./docs/ROADMAP.md) - 開発ロードマップ
- [INFRASTRUCTURE_COST.md](./docs/INFRASTRUCTURE_COST.md) - インフラ構成・コスト

---

## ⌨️ キーボードショートカット

| キー | アクション |
|------|------------|
| Space / Enter | カードを裏返す |
| ← | まだ覚えていない |
| → | 覚えた |
| S | 発音を聞く |

---

## 🎯 ロードマップ

- **2026年1月**: 基盤構築（認証、レベル判定）
- **2026年2月**: ニュース学習コア
- **2026年3月**: AI統合（Python MCP）
- **2026年4月**: ソーシャル機能
- **2026年5月**: Flutterモバイルアプリ
- **2026年6月**: 商用リリース 🚀

---

## 📄 ライセンス

MIT License

---

## 🙏 謝辞

このプロジェクトは語学学習をより楽しく、効果的にすることを目指しています。
