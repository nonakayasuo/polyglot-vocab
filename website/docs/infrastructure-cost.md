---
sidebar_position: 7
title: インフラコスト
---


## 概要

個人開発フェーズから商用リリースまで、段階的にスケールできる構成です。
**初期月額コスト: $0〜$20** を目標とします。

---

## 🎯 推奨構成（コスト最適化版）

### フェーズ1: 開発〜βテスト（月額 $0〜$5）

```
┌─────────────────────────────────────────────────────────────────┐
│                    個人開発・βテスト構成                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Vercel (Hobby/Pro)                      │   │
│  │  • Next.js ホスティング     無料〜$20/月                   │   │
│  │  • Edge Functions          無制限                         │   │
│  │  • Analytics               無料                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Render.com (Free)                       │   │
│  │  • Python FastAPI          無料（750時間/月）             │   │
│  │  • 自動スリープあり         開発中は問題なし               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │   Neon (Free)  │  │ Upstash (Free) │  │ Cloudflare R2  │    │
│  │                │  │                │  │    (Free)      │    │
│  │ PostgreSQL     │  │ Redis          │  │ Storage        │    │
│  │ 0.5GB          │  │ 10K cmd/day    │  │ 10GB           │    │
│  │ + pgvector     │  │                │  │                │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### サービス別詳細

| サービス | プラン | 月額 | 無料枠 | 用途 |
|---------|-------|------|-------|------|
| **Vercel** | Hobby | $0 | 100GB帯域、無制限デプロイ | Next.jsホスティング |
| **Neon** | Free | $0 | 0.5GB、1プロジェクト | PostgreSQL + pgvector |
| **Render** | Free | $0 | 750時間/月（スリープあり） | Python AIサービス |
| **Upstash Redis** | Free | $0 | 10K commands/day | セッション、キャッシュ |
| **Cloudflare R2** | Free | $0 | 10GB、1M reads/月 | 画像・ファイル保存 |
| **Cloudflare** | Free | $0 | 無制限 | CDN、DNS、WAF |

**合計: $0/月** ✨

---

## 🚀 フェーズ2: 商用リリース後（月額 $20〜$50）

ユーザー増加に応じてアップグレード：

| サービス | プラン | 月額 | スペック |
|---------|-------|------|---------|
| **Vercel** | Pro | $20 | チーム機能、高速ビルド |
| **Neon** | Launch | $19 | 10GB、オートスケール |
| **Render** | Starter | $7 | 常時起動、512MB RAM |
| **Upstash Redis** | Pay-as-you-go | $0〜$5 | 従量課金 |
| **Cloudflare R2** | Pay-as-you-go | $0〜$5 | 従量課金 |

**合計: $46〜$56/月**

---

## 📊 サービス選定理由

### 1. Vercel（Next.jsホスティング）

**選定理由:**
- Next.jsの開発元で最適化が完璧
- Edge Functionsで低レイテンシ
- Hobby プランで十分な無料枠

**代替案と比較:**
| サービス | 無料枠 | 特徴 |
|---------|-------|------|
| Vercel | 100GB帯域 | Next.js最適化 ✅ |
| Cloudflare Pages | 無制限 | 静的サイト向け |
| Netlify | 100GB帯域 | 機能同等だがVercel優位 |

### 2. Neon + pgvector（PostgreSQL + ベクトル検索）

**選定理由:**
- **Pineconeを不要に** → pgvectorで代替
- サーバーレスで自動スケール
- 無料枠が十分（0.5GB）

**pgvectorでベクトル検索:**
```sql
-- Neonでpgvector有効化
CREATE EXTENSION vector;

-- 埋め込みベクトル保存
CREATE TABLE word_embeddings (
  id SERIAL PRIMARY KEY,
  word TEXT,
  embedding vector(1536)  -- OpenAI embedding size
);

-- 類似検索
SELECT word, 1 - (embedding <=> query_embedding) as similarity
FROM word_embeddings
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

**コスト削減効果:** Pinecone $70/月 → $0

### 3. Render.com（Python AIサービス）

**選定理由:**
- 無料枠が使いやすい（750時間/月）
- Dockerサポート
- 簡単なデプロイ

**代替案と比較:**
| サービス | 無料枠 | 特徴 |
|---------|-------|------|
| Render | 750時間/月 | シンプル ✅ |
| Railway | $5クレジット/月 | 使い切ると停止 |
| Fly.io | $5クレジット/月 | 設定が複雑 |
| Hugging Face Spaces | 無制限 | ML特化だが制限多 |

**注意:** 無料プランは15分アイドルでスリープ → 商用後はStarterプランへ

### 4. Upstash Redis

**選定理由:**
- サーバーレスRedis
- 無料枠で開発十分（10K commands/day）
- Better Authのセッション保存に最適

### 5. Cloudflare R2 + CDN

**選定理由:**
- S3互換で安い（エグレス無料）
- 10GB無料
- CDNも無料で利用

---

## 🔧 環境変数設定

```bash
# .env.local (開発用)

# Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/newslingua?sslmode=require"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Cloudflare R2
R2_ACCOUNT_ID="xxx"
R2_ACCESS_KEY_ID="xxx"
R2_SECRET_ACCESS_KEY="xxx"
R2_BUCKET_NAME="newslingua-assets"

# AI Service (Render)
AI_SERVICE_URL="https://newslingua-ai.onrender.com"

# Better Auth
BETTER_AUTH_SECRET="xxx"
BETTER_AUTH_URL="https://newslingua.vercel.app"

# Anthropic (AI)
ANTHROPIC_API_KEY="sk-ant-xxx"
```

---

## 📈 スケーリング戦略

### ユーザー数に応じた移行計画

| ユーザー数 | 月額目安 | 主な変更 |
|-----------|---------|---------|
| 〜100 | $0 | 無料枠で運用 |
| 〜1,000 | $30 | Render有料化 |
| 〜10,000 | $100 | Neon Launch、キャッシュ強化 |
| 〜100,000 | $300〜 | 専用インスタンス検討 |

### ボトルネック対策

1. **AIサービスのレスポンス遅延**
   - Upstash Redisでレスポンスキャッシュ
   - よく使う単語説明をプリキャッシュ

2. **データベース負荷**
   - Neonの読み取りレプリカ活用
   - クエリ最適化とインデックス

3. **ストレージ増加**
   - R2の従量課金は安い（$0.015/GB/月）
   - 古いキャッシュデータの自動削除

---

## 🛡️ セキュリティ対策

すべて無料で利用可能：

| 対策 | サービス | コスト |
|-----|---------|-------|
| DDoS保護 | Cloudflare | 無料 |
| WAF | Cloudflare | 無料 |
| SSL/TLS | 各サービス自動 | 無料 |
| シークレット管理 | Vercel/Render環境変数 | 無料 |

---

## 📝 まとめ

### 現在の推奨構成

```
Web:     Vercel (Free)           $0
DB:      Neon + pgvector (Free)  $0
Cache:   Upstash Redis (Free)    $0
AI:      Render (Free)           $0
Storage: Cloudflare R2 (Free)    $0
CDN:     Cloudflare (Free)       $0
─────────────────────────────────
合計:                            $0/月
```

### 商用リリース時

```
Web:     Vercel Pro              $20
DB:      Neon Launch             $19
Cache:   Upstash (従量)          ~$5
AI:      Render Starter          $7
Storage: R2 (従量)               ~$5
CDN:     Cloudflare (Free)       $0
─────────────────────────────────
合計:                            ~$56/月
```

### 外部API費用（従量課金）

| API | 料金 | 備考 |
|-----|-----|------|
| Anthropic Claude | $3/$15 per 1M tokens | Input/Output |
| OpenAI Embeddings | $0.13 per 1M tokens | ベクトル生成 |
| News API | $0〜$449/月 | 無料枠あり |

---

*最終更新: 2025年12月27日*

