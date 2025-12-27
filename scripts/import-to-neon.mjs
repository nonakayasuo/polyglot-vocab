// SQLite → Neon PostgreSQL 移行スクリプト (シンプル版)
import Database from "better-sqlite3";
import pg from "pg";
import { randomUUID } from "crypto";
import "dotenv/config";

const { Pool } = pg;

const sqlite = new Database("./dev.db", { readonly: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log("🚀 SQLite → Neon PostgreSQL 移行開始...\n");

  const client = await pool.connect();

  try {
    // VocabularyWord を移行
    console.log("📚 VocabularyWord 移行中...");
    const words = sqlite.prepare("SELECT * FROM VocabularyWord").all();
    console.log(`   ${words.length} 語を検出`);

    let count = 0;
    for (const w of words) {
      try {
        await client.query(
          `INSERT INTO "VocabularyWord" 
           (id, word, pronunciation, category, meaning, example, "exampleTranslation", note, language, check1, check2, check3, "displayOrder", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            w.id || randomUUID(),
            w.word,
            w.pronunciation || "",
            w.category || "Noun",
            w.meaning || "",
            w.example || "",
            w.exampleTranslation || "",
            w.note || "",
            w.language || "english",
            Boolean(w.check1),
            Boolean(w.check2),
            Boolean(w.check3),
            w.displayOrder || 0,
            w.createdAt ? new Date(w.createdAt) : new Date(),
            w.updatedAt ? new Date(w.updatedAt) : new Date(),
          ]
        );
        count++;
        if (count % 100 === 0) console.log(`   ${count}/${words.length} 完了`);
      } catch (e) {
        console.error(`   ⚠️ 失敗: ${w.word}`, e.message);
      }
    }
    console.log(`   ✅ ${count} 語を移行完了\n`);

    // 確認
    const result = await client.query('SELECT COUNT(*) FROM "VocabularyWord"');
    console.log(`📊 Neon DB 単語数: ${result.rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }

  console.log("\n🎉 移行完了!");
}

migrate().catch(console.error);
