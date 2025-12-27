/**
 * 入力検証とサニタイゼーションユーティリティ
 */

/**
 * HTMLエスケープ（XSS対策）
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * SQLインジェクション対策（基本的なパターン検出）
 * Prismaはパラメータ化クエリを使用するため通常は不要
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
    /(--)|(\/\*)/,
    /(\bOR\b|\bAND\b).*=.*/i,
    /'\s*OR\s*'1'\s*=\s*'1/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * メールアドレスの検証
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URLの検証
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 文字列の長さ検証
 */
export function validateLength(
  value: string,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (value.length < min) {
    return { valid: false, error: `最小${min}文字以上必要です` };
  }
  if (value.length > max) {
    return { valid: false, error: `最大${max}文字以下にしてください` };
  }
  return { valid: true };
}

/**
 * パスワード強度の検証
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    errors.push("8文字以上必要です");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    errors.push("小文字を含めてください");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push("大文字を含めてください");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push("数字を含めてください");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * ユーザー入力のサニタイズ
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // 制御文字を削除
    .slice(0, 10000); // 最大長を制限
}

/**
 * ファイル名のサニタイズ
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-") // 不正な文字を置換
    .replace(/\s+/g, "_") // スペースをアンダースコアに
    .slice(0, 255); // 最大長を制限
}

/**
 * IDの検証（UUID形式）
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * ページネーションパラメータの検証
 */
export function validatePagination(
  page: unknown,
  limit: unknown
): { page: number; limit: number } {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  return {
    page: Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
    limit: Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100
      ? 20
      : parsedLimit,
  };
}

/**
 * APIエラーレスポンスの作成
 */
export function createValidationError(
  field: string,
  message: string
): { error: string; field: string } {
  return { error: message, field };
}

