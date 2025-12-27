# Polyglot Vocab - API設計書

## 概要

RESTful APIとWebSocket APIの設計仕様書です。
Hono + OpenAPIを使用し、型安全なAPI開発を実現します。

---

## 認証

### Bearer Token

```http
Authorization: Bearer <access_token>
```

### API Key（外部連携用）

```http
X-API-Key: <api_key>
```

---

## エンドポイント一覧

### 認証 (Auth)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/auth/signup | ユーザー登録 | - |
| POST | /api/auth/signin | ログイン | - |
| POST | /api/auth/signout | ログアウト | 必須 |
| GET | /api/auth/session | セッション取得 | 必須 |
| POST | /api/auth/forgot-password | パスワードリセット要求 | - |
| POST | /api/auth/reset-password | パスワードリセット | - |
| POST | /api/auth/verify-email | メール認証 | - |

### ユーザー (Users)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/users/me | 現在のユーザー情報 | 必須 |
| PATCH | /api/users/me | ユーザー情報更新 | 必須 |
| DELETE | /api/users/me | アカウント削除 | 必須 |
| GET | /api/users/me/settings | 設定取得 | 必須 |
| PATCH | /api/users/me/settings | 設定更新 | 必須 |
| GET | /api/users/:id | ユーザー情報取得（公開） | - |

### 単語帳 (Vocabulary)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/words | 単語一覧取得 | 必須 |
| POST | /api/words | 単語追加 | 必須 |
| GET | /api/words/:id | 単語詳細取得 | 必須 |
| PATCH | /api/words/:id | 単語更新 | 必須 |
| DELETE | /api/words/:id | 単語削除 | 必須 |
| POST | /api/words/bulk | 一括追加 | 必須 |
| DELETE | /api/words/bulk | 一括削除 | 必須 |
| POST | /api/words/import | CSVインポート | 必須 |
| GET | /api/words/export | CSVエクスポート | 必須 |

### フラッシュカード (Flashcards)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/flashcards/session | 学習セッション開始 | 必須 |
| POST | /api/flashcards/review | レビュー結果記録 | 必須 |
| GET | /api/flashcards/due | 復習待ち単語取得 | 必須 |
| GET | /api/flashcards/stats | フラッシュカード統計 | 必須 |

### ニュース (News)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/news | ニュース一覧 | - |
| GET | /api/news/:id | ニュース詳細 | - |
| GET | /api/news/recommended | おすすめニュース | 必須 |
| POST | /api/news/:id/read | 読了記録 | 必須 |
| GET | /api/news/sources | ニュースソース一覧 | - |

### AI (MCP統合)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/ai/explain | 単語・文法説明 | 必須(Pro) |
| POST | /api/ai/examples | 例文生成 | 必須(Pro) |
| POST | /api/ai/analyze | 記事分析 | 必須(Pro) |
| POST | /api/ai/chat | AIチャット | 必須(Pro) |
| POST | /api/ai/recommend | 学習レコメンド | 必須 |

### 進捗 (Progress)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/progress | 進捗サマリー | 必須 |
| GET | /api/progress/history | 学習履歴 | 必須 |
| GET | /api/progress/streak | ストリーク情報 | 必須 |
| GET | /api/progress/stats | 詳細統計 | 必須 |

### 決済 (Billing)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/billing/plans | プラン一覧 | - |
| GET | /api/billing/subscription | 現在のサブスクリプション | 必須 |
| POST | /api/billing/checkout | チェックアウトセッション作成 | 必須 |
| POST | /api/billing/portal | カスタマーポータルURL | 必須 |
| POST | /api/billing/webhook | Stripe Webhook | - |

---

## API詳細仕様

### 単語一覧取得

```http
GET /api/words?language=en&status=learning&page=1&limit=20&sort=-createdAt
```

#### Query Parameters

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| language | string | - | 言語フィルター（en, es, ko, zh, fr, de） |
| status | string | - | ステータス（new, learning, mastered） |
| category | string | - | 品詞フィルター |
| search | string | - | 検索キーワード |
| page | number | - | ページ番号（デフォルト: 1） |
| limit | number | - | 1ページあたりの件数（デフォルト: 20, 最大: 100） |
| sort | string | - | ソート（createdAt, -createdAt, word, -word） |

#### Response

```json
{
  "data": [
    {
      "id": "clx1234567890",
      "word": "serendipity",
      "pronunciation": "/ˌserənˈdɪpəti/",
      "category": "noun",
      "meaning": "偶然の幸運な発見",
      "example": "Finding this cafe was pure serendipity.",
      "exampleTranslation": "このカフェを見つけたのは全くの偶然の幸運だった。",
      "note": "良いことが偶然起こるニュアンス",
      "language": "en",
      "status": "learning",
      "checkCount": 2,
      "lastReviewedAt": "2024-12-26T10:00:00Z",
      "nextReviewAt": "2024-12-29T10:00:00Z",
      "createdAt": "2024-12-20T08:00:00Z",
      "updatedAt": "2024-12-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 単語追加

```http
POST /api/words
Content-Type: application/json

{
  "word": "ephemeral",
  "pronunciation": "/ɪˈfemərəl/",
  "category": "adjective",
  "meaning": "はかない、つかの間の",
  "example": "Fame is often ephemeral in the digital age.",
  "exampleTranslation": "デジタル時代において名声はしばしばはかない。",
  "note": "短い期間しか続かないものを表す",
  "language": "en"
}
```

#### Response

```json
{
  "data": {
    "id": "clx9876543210",
    "word": "ephemeral",
    "pronunciation": "/ɪˈfemərəl/",
    "category": "adjective",
    "meaning": "はかない、つかの間の",
    "example": "Fame is often ephemeral in the digital age.",
    "exampleTranslation": "デジタル時代において名声はしばしばはかない。",
    "note": "短い期間しか続かないものを表す",
    "language": "en",
    "status": "new",
    "checkCount": 0,
    "createdAt": "2024-12-27T12:00:00Z",
    "updatedAt": "2024-12-27T12:00:00Z"
  }
}
```

### AI説明生成

```http
POST /api/ai/explain
Content-Type: application/json

{
  "word": "ubiquitous",
  "language": "en",
  "context": "Smartphones have become ubiquitous in modern society.",
  "options": {
    "includeEtymology": true,
    "includeSynonyms": true,
    "includeExamples": true,
    "userLevel": "intermediate"
  }
}
```

#### Response

```json
{
  "data": {
    "word": "ubiquitous",
    "pronunciation": "/juːˈbɪkwɪtəs/",
    "partOfSpeech": "adjective",
    "cefrLevel": "C1",
    "meanings": [
      {
        "definition": "どこにでもある、遍在する",
        "usage": "何かが非常に一般的で、どこでも見られることを表す"
      }
    ],
    "etymology": {
      "origin": "ラテン語 'ubique' (どこでも) から",
      "yearFirstUsed": "17世紀"
    },
    "synonyms": [
      {
        "word": "omnipresent",
        "nuance": "より文学的、神の存在を連想させる"
      },
      {
        "word": "pervasive",
        "nuance": "広がっている、浸透しているイメージ"
      },
      {
        "word": "widespread",
        "nuance": "一般的で使いやすい"
      }
    ],
    "examples": [
      {
        "sentence": "Smartphones have become ubiquitous in modern society.",
        "translation": "スマートフォンは現代社会でどこにでもある存在になった。"
      },
      {
        "sentence": "Coffee shops are now ubiquitous in major cities.",
        "translation": "コーヒーショップは今や大都市のどこにでもある。"
      }
    ],
    "collocations": [
      "ubiquitous presence",
      "ubiquitous technology",
      "become ubiquitous"
    ],
    "memoryTip": "「ユビキタス」は日本語でも使われる。どこにでもあるイメージで覚えよう。"
  }
}
```

### フラッシュカードセッション

```http
GET /api/flashcards/session?language=en&count=20&mode=review
```

#### Response

```json
{
  "data": {
    "sessionId": "sess_abc123",
    "cards": [
      {
        "id": "clx1234567890",
        "word": "serendipity",
        "pronunciation": "/ˌserənˈdɪpəti/",
        "category": "noun",
        "meaning": "偶然の幸運な発見",
        "example": "Finding this cafe was pure serendipity.",
        "exampleTranslation": "このカフェを見つけたのは全くの偶然の幸運だった。",
        "reviewCount": 3,
        "lastReviewedAt": "2024-12-26T10:00:00Z",
        "difficulty": 0.6
      }
    ],
    "totalCards": 20,
    "mode": "review",
    "estimatedTime": 10
  }
}
```

### レビュー結果記録

```http
POST /api/flashcards/review
Content-Type: application/json

{
  "sessionId": "sess_abc123",
  "wordId": "clx1234567890",
  "rating": 4,
  "timeSpent": 5000
}
```

#### Rating Scale (SM-2)

| 値 | 意味 |
|-----|------|
| 0 | 完全に忘れた |
| 1 | 間違えた、ヒントで思い出した |
| 2 | 間違えたが、正解を見て思い出した |
| 3 | 正解したが、かなり迷った |
| 4 | 正解、少し迷った |
| 5 | 完璧に覚えていた |

#### Response

```json
{
  "data": {
    "wordId": "clx1234567890",
    "newEaseFactor": 2.5,
    "newInterval": 6,
    "nextReviewAt": "2025-01-02T10:00:00Z",
    "status": "learning"
  }
}
```

---

## WebSocket API

### 接続

```javascript
const ws = new WebSocket('wss://api.polyglot-vocab.com/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer <access_token>'
  }));
};
```

### イベント

#### 同期イベント

```json
// サーバー → クライアント
{
  "type": "sync",
  "data": {
    "operation": "create",
    "entity": "word",
    "data": { /* word object */ }
  }
}
```

#### 学習リマインダー

```json
// サーバー → クライアント
{
  "type": "reminder",
  "data": {
    "message": "復習の時間です！",
    "dueCount": 15
  }
}
```

---

## エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力データが無効です",
    "details": [
      {
        "field": "word",
        "message": "単語は必須です"
      }
    ]
  }
}
```

### エラーコード

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| UNAUTHORIZED | 401 | 認証が必要 |
| FORBIDDEN | 403 | アクセス権限なし |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | バリデーションエラー |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| SUBSCRIPTION_REQUIRED | 402 | 有料プランが必要 |
| INTERNAL_ERROR | 500 | サーバーエラー |

---

## レート制限

| プラン | リクエスト/分 | AI API/日 |
|--------|-------------|-----------|
| Free | 60 | 10 |
| Pro | 300 | 100 |
| Business | 1000 | 無制限 |

### ヘッダー

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703680800
```

---

## SDKサンプル

### JavaScript SDK

```typescript
import { PolyglotVocab } from '@polyglot-vocab/sdk';

const client = new PolyglotVocab({
  apiKey: 'your_api_key',
});

// 単語一覧取得
const words = await client.words.list({
  language: 'en',
  status: 'learning',
});

// 単語追加
const newWord = await client.words.create({
  word: 'serendipity',
  meaning: '偶然の幸運な発見',
  language: 'en',
});

// AI説明取得
const explanation = await client.ai.explain({
  word: 'ubiquitous',
  language: 'en',
});
```

### Python SDK

```python
from polyglot_vocab import PolyglotVocab

client = PolyglotVocab(api_key="your_api_key")

# 単語一覧取得
words = client.words.list(language="en", status="learning")

# 単語追加
new_word = client.words.create(
    word="serendipity",
    meaning="偶然の幸運な発見",
    language="en"
)

# AI説明取得
explanation = client.ai.explain(
    word="ubiquitous",
    language="en"
)
```

---

*最終更新: 2024年12月27日*

