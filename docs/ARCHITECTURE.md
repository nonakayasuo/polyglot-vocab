# NewsLingua - 技術アーキテクチャ設計書

## 概要

ニュースベースの語学学習プラットフォームとして、スケーラビリティ、セキュリティ、AI統合を重視したアーキテクチャ設計です。

---

## システム全体図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              クライアント層                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                    │
│  │   Web App    │   │   iOS App    │   │ Android App  │                    │
│  │   Next.js    │   │   Flutter    │   │   Flutter    │                    │
│  │   + PWA      │   │  + Dart 3    │   │  + Dart 3    │                    │
│  └──────────────┘   └──────────────┘   └──────────────┘                    │
│                                                                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS / WebSocket
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              エッジ層                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Cloudflare                                        │   │
│  │  • CDN  • WAF  • DDoS Protection  • Rate Limiting                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         バックエンド層（ハイブリッド）                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                    Next.js API (TypeScript) - Vercel                   ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    ││
│  │  │   Auth      │  │   Core API  │  │  WebSocket  │                    ││
│  │  │(Better Auth)│  │   (Hono)    │  │    Sync     │                    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘                    ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                    Python AI Service - Railway/Fly.io                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    ││
│  │  │  FastAPI    │  │ MCP Server  │  │   LLM       │                    ││
│  │  │  REST API   │  │   Tools     │  │ Integration │                    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    ││
│  │  │  News       │  │  Level      │  │  Vector     │                    ││
│  │  │  Processor  │  │  Assessment │  │  Search     │                    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘                    ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              データ層                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │  PostgreSQL   │  │    Redis      │  │  Cloudflare   │                   │
│  │    (Neon)     │  │  (Upstash)    │  │      R2       │                   │
│  │               │  │               │  │   (Storage)   │                   │
│  │ • Users       │  │ • Sessions    │  │ • Images      │                   │
│  │ • Vocabulary  │  │ • Cache       │  │ • Audio       │                   │
│  │ • Articles    │  │ • Rate Limit  │  │ • Exports     │                   │
│  │ • Assessments │  │ • Pub/Sub     │  │               │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │   pgvector    │  │   Vercel      │  │    Stripe     │                   │
│  │  (in Neon)    │  │  Analytics    │  │  (Payments)   │                   │
│  │               │  │               │  │               │                   │
│  │ • Embeddings  │  │ • Events      │  │ • Subs        │                   │
│  │ • Similarity  │  │ • Funnels     │  │ • Invoices    │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            外部サービス連携                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │  News APIs    │  │  AI Providers │  │  Partner APIs │                   │
│  │               │  │               │  │               │                   │
│  │ • NewsAPI     │  │ • Anthropic   │  │ • HelloTalk   │                   │
│  │ • BBC         │  │ • OpenAI      │  │ • Tandem      │                   │
│  │ • Guardian    │  │ • Google      │  │ • iTalki      │                   │
│  │ • NHK World   │  │               │  │               │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 技術スタック詳細

### フロントエンド（TypeScript）

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16+ | Webアプリフレームワーク |
| React | 19+ | UIライブラリ |
| TypeScript | 5+ | 型安全性 |
| Tailwind CSS | 4+ | スタイリング |
| Radix UI | latest | アクセシブルなUIコンポーネント |
| TanStack Query | 5+ | サーバー状態管理 |
| Zustand | 5+ | クライアント状態管理 |
| Flutter | 3.24+ | モバイルアプリ（BtoC向け高パフォーマンス） |
| Dart | 3.5+ | Flutter開発言語 |
| Riverpod | 2+ | 状態管理 |
| go_router | latest | ルーティング |

### バックエンド - TypeScript（Core API）

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Hono | 4+ | 軽量APIフレームワーク |
| Better Auth | latest | 認証 |
| Prisma | 7+ | ORM |
| Zod | 3+ | スキーマバリデーション |

### バックエンド - Python（AI Service）

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **FastAPI** | 0.110+ | AI APIフレームワーク |
| **MCP SDK** | latest | MCPサーバー実装 |
| **LangChain** | latest | LLMオーケストレーション |
| **Anthropic SDK** | latest | Claude API統合 |
| **OpenAI SDK** | latest | GPT/Embeddings |
| **spaCy** | 3+ | 自然言語処理 |
| **Pydantic** | 2+ | データバリデーション |
| **SQLAlchemy** | 2+ | DB操作（読み取り用） |

### インフラストラクチャ（コスト最適化版）

| サービス | 用途 | 理由 | 月額 |
|---------|------|------|------|
| Vercel | Next.jsホスティング | 最適化、エッジ | $0（Hobby） |
| Render.com | Python AIサービス | 無料枠充実 | $0（Free） |
| Neon | PostgreSQL + pgvector | サーバーレス、ベクトル検索 | $0（Free） |
| Upstash | Redis | サーバーレス、セッション | $0（Free） |
| Cloudflare R2 | オブジェクトストレージ | エグレス無料 | $0（Free） |
| Cloudflare | CDN、WAF、DNS | セキュリティ | $0（Free） |

> **Note:** 詳細は [INFRASTRUCTURE_COST.md](./INFRASTRUCTURE_COST.md) を参照

---

## サービス間通信

### TypeScript ↔ Python 連携

```
┌─────────────────────────────────────────────────────────────────┐
│                    サービス間通信フロー                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  クライアント                                                     │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────┐                                                 │
│  │  Next.js    │  ← API Routes                                   │
│  │  (Vercel)   │                                                 │
│  └──────┬──────┘                                                 │
│         │                                                         │
│         │  HTTP/JSON (認証トークン付き)                           │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                 │
│  │  FastAPI    │  ← AI処理専用                                   │
│  │  (Railway)  │                                                 │
│  └─────────────┘                                                 │
│                                                                  │
│  通信パターン:                                                    │
│  • 同期: REST API（単語説明、例文生成）                           │
│  • 非同期: Webhook/Queue（記事分析、バッチ処理）                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### APIエンドポイント設計

```typescript
// Next.js → Python AI Service
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

// 単語説明
POST ${AI_SERVICE_URL}/api/v1/explain
{
  "word": "serendipity",
  "language": "en",
  "user_level": "B2",
  "context": "..."
}

// 記事分析
POST ${AI_SERVICE_URL}/api/v1/analyze-article
{
  "article_id": "...",
  "content": "...",
  "language": "en"
}

// レベル判定
POST ${AI_SERVICE_URL}/api/v1/assess-level
{
  "user_id": "...",
  "answers": [...]
}
```

---

## Python AIサービス構成

```
python-ai-service/
├── app/
│   ├── main.py                 # FastAPIアプリ
│   ├── api/
│   │   ├── v1/
│   │   │   ├── explain.py      # 単語・文法説明
│   │   │   ├── examples.py     # 例文生成
│   │   │   ├── analyze.py      # 記事分析
│   │   │   ├── assess.py       # レベル判定
│   │   │   └── recommend.py    # レコメンド
│   │   └── deps.py             # 依存関係
│   ├── mcp/
│   │   ├── server.py           # MCPサーバー
│   │   ├── tools/
│   │   │   ├── vocabulary.py   # 語彙ツール
│   │   │   ├── grammar.py      # 文法ツール
│   │   │   ├── reading.py      # リーディングツール
│   │   │   └── progress.py     # 進捗ツール
│   │   └── resources.py        # MCPリソース
│   ├── services/
│   │   ├── llm.py              # LLM統合
│   │   ├── news_processor.py   # ニュース処理
│   │   ├── difficulty.py       # 難易度判定
│   │   └── vector_search.py    # ベクトル検索
│   ├── models/
│   │   └── schemas.py          # Pydanticスキーマ
│   └── core/
│       ├── config.py           # 設定
│       └── security.py         # セキュリティ
├── tests/
├── Dockerfile
├── requirements.txt
└── pyproject.toml
```

---

## レベル判定システム詳細

```
┌─────────────────────────────────────────────────────────────────┐
│                    レベル判定アーキテクチャ                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    フロントエンド                          │   │
│  │  • 質問表示  • 回答収集  • 進捗表示  • 結果表示            │   │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Python AI Service                       │   │
│  │                                                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │
│  │  │ 語彙テスト  │  │ 読解テスト  │  │  リスニング │          │   │
│  │  │   判定     │  │   判定     │  │   判定     │          │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘          │   │
│  │        │               │               │                  │   │
│  │        └───────────────┼───────────────┘                  │   │
│  │                        ▼                                   │   │
│  │              ┌────────────────┐                           │   │
│  │              │  総合レベル     │                           │   │
│  │              │   算出エンジン  │                           │   │
│  │              └────────────────┘                           │   │
│  │                        │                                   │   │
│  │                        ▼                                   │   │
│  │              ┌────────────────┐                           │   │
│  │              │  CEFR A1-C2    │                           │   │
│  │              │   + 詳細分析   │                           │   │
│  │              └────────────────┘                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### レベル判定アルゴリズム

```python
# python-ai-service/app/services/assessment.py

class LevelAssessment:
    """CEFRレベル判定エンジン"""
    
    CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
    
    def assess_vocabulary(self, answers: list[VocabAnswer]) -> float:
        """語彙テストからスコア算出（0-100）"""
        # 適応型テスト: 正解なら難しい問題、不正解なら簡単な問題
        # Item Response Theory (IRT) ベースの能力推定
        pass
    
    def assess_reading(self, answers: list[ReadingAnswer]) -> float:
        """読解テストからスコア算出（0-100）"""
        pass
    
    def calculate_cefr_level(
        self,
        vocab_score: float,
        reading_score: float,
        listening_score: float | None = None
    ) -> CEFRResult:
        """総合CEFRレベルを算出"""
        
        # 重み付け平均
        weights = {"vocab": 0.4, "reading": 0.4, "listening": 0.2}
        total_score = (
            vocab_score * weights["vocab"] +
            reading_score * weights["reading"] +
            (listening_score or reading_score) * weights["listening"]
        )
        
        # スコア→CEFRマッピング
        level = self._score_to_cefr(total_score)
        
        return CEFRResult(
            level=level,
            vocab_score=vocab_score,
            reading_score=reading_score,
            listening_score=listening_score,
            strengths=self._identify_strengths(...),
            weaknesses=self._identify_weaknesses(...),
            recommended_articles=self._get_recommendations(level),
        )
```

---

## ニュース処理パイプライン

```
┌─────────────────────────────────────────────────────────────────┐
│                    ニュース処理パイプライン                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  ニュース │───▶│  取得    │───▶│  解析    │───▶│  保存    │  │
│  │  ソース   │    │  Fetcher │    │ Analyzer │    │  Store   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                         │                        │
│                                         ▼                        │
│                                  ┌──────────────┐               │
│                                  │  難易度判定   │               │
│                                  │  • 語彙分析   │               │
│                                  │  • 文法複雑度 │               │
│                                  │  • CEFR付与  │               │
│                                  └──────────────┘               │
│                                         │                        │
│                                         ▼                        │
│                                  ┌──────────────┐               │
│                                  │  埋め込み生成 │               │
│                                  │  (Embeddings)│               │
│                                  └──────────────┘               │
│                                         │                        │
│                                         ▼                        │
│                                  ┌──────────────┐               │
│                                  │  Pinecone    │               │
│                                  │  保存        │               │
│                                  └──────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## データベーススキーマ拡張

```prisma
// prisma/schema.prisma

// ユーザー
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  image             String?
  emailVerified     DateTime?
  
  // レベル判定
  cefrLevel         String?  // A1, A2, B1, B2, C1, C2
  levelAssessedAt   DateTime?
  vocabScore        Float?
  readingScore      Float?
  listeningScore    Float?
  
  // サブスクリプション
  subscriptionTier  String   @default("free")
  
  // リレーション
  sessions          Session[]
  accounts          Account[]
  vocabularyWords   VocabularyWord[]
  readingHistory    ReadingHistory[]
  levelAssessments  LevelAssessment[]
  settings          UserSettings?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// レベル判定履歴
model LevelAssessment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  language        String   // en, es, ko, zh
  cefrLevel       String   // A1-C2
  vocabScore      Float
  readingScore    Float
  listeningScore  Float?
  
  // 詳細結果
  strengths       Json     // ["vocabulary", "reading"]
  weaknesses      Json     // ["listening", "grammar"]
  
  assessedAt      DateTime @default(now())
  
  @@index([userId])
  @@index([language])
}

// 記事（拡張）
model Article {
  id              String   @id @default(cuid())
  externalId      String   @unique
  title           String
  description     String   @default("")
  content         String   @default("")
  url             String
  imageUrl        String?
  source          String
  author          String?
  language        String   @default("en")
  category        String?
  
  // 難易度情報
  cefrLevel       String?  // A1-C2
  difficultyScore Float?   // 0-100
  wordCount       Int?
  avgSentenceLength Float?
  
  // ベクトル
  embeddingId     String?  // Pinecone ID
  
  publishedAt     DateTime
  cachedAt        DateTime @default(now())
  
  @@index([language])
  @@index([cefrLevel])
}
```

---

## セキュリティ設計

### 認証フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                    認証・認可フロー                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  クライアント → Next.js → Better Auth → セッション              │
│                                │                                 │
│                                ▼                                 │
│                         ┌──────────────┐                        │
│                         │  JWT Token   │                        │
│                         └──────┬───────┘                        │
│                                │                                 │
│            ┌───────────────────┼───────────────────┐            │
│            ▼                   ▼                   ▼            │
│     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│     │  Next.js API │   │  Python AI   │   │  WebSocket   │     │
│     │   (認証済み)  │   │  (JWT検証)   │   │   (認証済み) │     │
│     └──────────────┘   └──────────────┘   └──────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Python サービスでのJWT検証

```python
# python-ai-service/app/core/security.py

from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Next.jsから渡されたJWTを検証"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## デプロイメント

### CI/CD パイプライン

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  # TypeScript (Vercel)
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'

  # Python AI Service (Railway)
  deploy-ai:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ai-service
```

---

*最終更新: 2025年12月27日*
