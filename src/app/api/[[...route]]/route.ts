// Hono バックエンドAPI

import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// ヘルスチェック
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TTS用のエンドポイント（Web Speech APIを使用するため、実際の音声生成はクライアントサイド）
app.get("/tts/languages", (c) => {
  return c.json({
    languages: [
      { code: "en-US", name: "English (US)" },
      { code: "en-GB", name: "English (UK)" },
      { code: "es-ES", name: "Spanish (Spain)" },
      { code: "es-MX", name: "Spanish (Mexico)" },
      { code: "ko-KR", name: "Korean" },
      { code: "zh-CN", name: "Chinese (Simplified)" },
      { code: "zh-TW", name: "Chinese (Traditional)" },
      { code: "ja-JP", name: "Japanese" },
    ],
  });
});

// 将来のクラウド同期用エンドポイント（プレースホルダー）
app.get("/sync/status", (c) => {
  return c.json({
    enabled: false,
    message: "Cloud sync is not yet configured. Data is stored locally.",
  });
});

app.post("/sync/backup", async (c) => {
  return c.json({
    success: false,
    message: "Cloud backup is not yet implemented.",
  });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
