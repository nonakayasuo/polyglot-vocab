# Neon PostgreSQL セットアップガイド

## 概要

NewsLinguaはデータベースにNeon PostgreSQLを使用します。Neonはサーバーレスで、無料枠（0.5GB）で開発には十分です。

---

## 🚀 セットアップ手順

### Step 1: Neonアカウント作成

1. [https://neon.tech](https://neon.tech) にアクセス
2. **Sign Up** → GitHub/Google/Emailでアカウント作成

### Step 2: プロジェクト作成

1. ダッシュボードで **Create a project** をクリック
2. 設定:
   - **Project name**: `newslingua`
   - **Region**: `AWS US East 1` (または最寄りのリージョン)
   - **Postgres version**: `16` (最新推奨)
3. **Create project** をクリック

### Step 3: pgvector拡張を有効化

Neonダッシュボードの **SQL Editor** で以下を実行:

```sql
-- pgvector拡張を有効化（ベクトル検索用）
CREATE EXTENSION IF NOT EXISTS vector;

-- 確認
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Step 4: 接続文字列を取得

1. ダッシュボードの **Connection Details** を開く
2. **Pooled connection** のチェックを外す（Direct connection）
3. 接続文字列をコピー

### Step 5: .envを更新

```bash
# .env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR_ENDPOINT.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR_ENDPOINT.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Note:** `DATABASE_URL` と `DIRECT_URL` は同じ値で問題ありません。
Neonのプーリングを使う場合は `DATABASE_URL` に `-pooler` 付きのエンドポイントを使用できます。

### Step 6: マイグレーション実行

```bash
# Prismaクライアント生成
pnpm prisma generate

# マイグレーション実行（新規DB）
pnpm prisma migrate dev --name init

# または本番環境向け
pnpm prisma migrate deploy
```

---

## 📊 pgvector の使い方

### ベクトル検索のSQLサンプル

```sql
-- 類似単語検索（コサイン類似度）
SELECT word, 1 - (embedding <=> $1::vector) as similarity
FROM word_embedding
WHERE language = 'english'
ORDER BY embedding <=> $1::vector
LIMIT 10;

-- L2距離による検索
SELECT word, embedding <-> $1::vector as distance
FROM word_embedding
ORDER BY embedding <-> $1::vector
LIMIT 10;
```

### Prismaでの使用

```typescript
// 生SQLでベクトル検索
const similarWords = await prisma.$queryRaw`
  SELECT word, 1 - (embedding <=> ${embedding}::vector) as similarity
  FROM word_embedding
  WHERE language = ${language}
  ORDER BY embedding <=> ${embedding}::vector
  LIMIT 10
`;
```

---

## 🔧 トラブルシューティング

### エラー: `extension "vector" is not available`

Neonダッシュボードで手動で拡張を有効化してください:
```sql
CREATE EXTENSION vector;
```

### エラー: `connection refused`

- 接続文字列の `?sslmode=require` を確認
- Neonダッシュボードでプロジェクトがアクティブか確認

### エラー: `too many connections`

Prismaの接続プール設定を追加:
```
DATABASE_URL="...?sslmode=require&connection_limit=5"
```

---

## 📈 無料枠の制限

| リソース | 無料枠 |
|---------|-------|
| ストレージ | 0.5GB |
| コンピュート時間 | 191時間/月 |
| プロジェクト数 | 1 |
| ブランチ数 | 10 |

開発には十分ですが、商用リリース時は **Launch プラン ($19/月)** へアップグレードを検討してください。

---

## 🔗 参考リンク

- [Neon ドキュメント](https://neon.tech/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Prisma + Neon ガイド](https://neon.tech/docs/guides/prisma)

---

*最終更新: 2025年12月27日*

