# NewsLingua - ドキュメントインデックス

## 📰 ニュースで学ぶ次世代語学プラットフォーム

このディレクトリには、NewsLinguaの商用化に向けた要件定義・設計ドキュメントが含まれています。

---

## 📋 プロダクト・計画

| ドキュメント | 説明 |
|-------------|------|
| [PRD.md](./PRD.md) | **プロダクト要件定義書** - ビジョン、機能要件、ビジネスモデル |
| [ROADMAP.md](./ROADMAP.md) | **開発ロードマップ** - 2026年1月〜6月の詳細スケジュール |
| [IDEAS.md](./IDEAS.md) | **追加機能アイデア集** - 将来的な機能拡張のアイデア |

---

## 🏗️ 技術設計

| ドキュメント | 説明 |
|-------------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | **システムアーキテクチャ** - ハイブリッド構成（TypeScript + Python） |
| [AUTH_DESIGN.md](./AUTH_DESIGN.md) | **認証設計書** - Better Auth統合の詳細設計 |
| [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) | **MCP統合計画** - Python MCPサーバー・AIツール設計 |
| [API_SPEC.md](./API_SPEC.md) | **API仕様書** - RESTful API、WebSocket仕様 |
| [INFRASTRUCTURE_COST.md](./INFRASTRUCTURE_COST.md) | **インフラ構成・コスト** - 無料枠活用の最適化構成 |

---

## 🎯 コアコンセプト

> **「生きた言語を、生きたニュースから学ぶ」**

NewsLinguaは、世界中のニュースを読みながら語学力を向上させるプラットフォームです。

### 主要機能

- 📰 **リアルタイムニュース学習** - BBC, CNN, NHK World等の実際のニュース
- 🎯 **レベル判定システム** - 初回診断でCEFRレベル判定、適切な記事を推薦
- 🤖 **AI学習アシスタント** - Python MCP統合で文法・語彙サポート
- 🌐 **グローバル連携** - HelloTalk等との協業で実践機会提供

---

## 📅 開発フェーズ概要（2026年上期）

```
2026年
├── 1月: Phase 1 - 基盤構築
│   • Better Auth認証
│   • レベル判定システム
│   • クラウドDB移行
│
├── 2月: Phase 2 - ニュース学習コア
│   • 多ニュースソース対応
│   • 難易度自動判定
│   • インタラクティブリーディング
│
├── 3月: Phase 3 - AI統合（Python）
│   • FastAPI AIサービス
│   • MCP Server実装
│   • AI学習アシスタント
│
├── 4月: Phase 4 - ソーシャル機能
│   • コミュニティ
│   • 外部連携
│
├── 5月: Phase 5 - モバイル
│   • Flutterアプリ
│   • 多言語UI
│
└── 6月: Phase 6 - ローンチ 🚀
    • 決済機能
    • 正式リリース
```

---

## 🔧 技術スタック

### フロントエンド（TypeScript）
- Next.js 16+ / React 19
- Flutter + Dart 3（モバイル）
- Tailwind CSS 4

### バックエンド
- **TypeScript**: Hono（Core API）、Better Auth（認証）
- **Python**: FastAPI（AI）、MCP Server

### インフラ（コスト最適化: $0/月〜）
- Vercel（Hobby無料）、Render.com（無料枠）
- Neon PostgreSQL + pgvector（無料枠）
- Upstash Redis（無料枠）、Cloudflare R2（無料枠）

---

## 📝 ドキュメント更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2025-12-27 | Flutter採用、インフラコスト最適化ドキュメント追加 |
| 2025-12-27 | NewsLinguaにリブランド、Python AI統合、レベル判定追加 |
| 2024-12-27 | 初版作成 |

---

*最終更新: 2025年12月27日*
