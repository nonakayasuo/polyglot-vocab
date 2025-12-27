/**
 * シンプルなメモリベースのレート制限
 * 本番環境ではRedisベースの実装を推奨
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 定期的にクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // 1分ごと

interface RateLimitConfig {
  /**
   * 制限時間内の最大リクエスト数
   */
  limit: number;
  /**
   * 制限時間（ミリ秒）
   */
  window: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * レート制限をチェック
 * @param key 一意の識別子（例: IP アドレス + エンドポイント）
 * @param config レート制限設定
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // エントリがない、または期限切れの場合
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.window,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + config.window,
    };
  }

  // 制限内の場合
  if (entry.count < config.limit) {
    entry.count++;
    return {
      success: true,
      remaining: config.limit - entry.count,
      reset: entry.resetAt,
    };
  }

  // 制限超過
  return {
    success: false,
    remaining: 0,
    reset: entry.resetAt,
  };
}

/**
 * プリセット設定
 */
export const RATE_LIMITS = {
  // 一般的なAPIリクエスト: 1分あたり60回
  api: { limit: 60, window: 60 * 1000 },

  // AI関連のリクエスト: 1分あたり10回
  ai: { limit: 10, window: 60 * 1000 },

  // 認証関連: 5分あたり5回
  auth: { limit: 5, window: 5 * 60 * 1000 },

  // 管理者API: 1分あたり30回
  admin: { limit: 30, window: 60 * 1000 },
} as const;

/**
 * リクエストからクライアントIPを取得
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * レート制限をかけるヘルパー関数
 */
export function createRateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

