import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// 認証が必要なルート
const protectedRoutes = ["/dashboard", "/settings", "/profile", "/admin"];

// 認証済みユーザーがアクセスできないルート（リダイレクト）
const authRoutes = ["/signin", "/signup", "/forgot-password"];

// レート制限対象のAPIパス
const rateLimitedPaths = [
  { path: "/api/words/analyze", limit: 10, window: 60000 }, // AI分析
  { path: "/api/news/analyze", limit: 10, window: 60000 },  // ニュース分析
  { path: "/api/auth", limit: 5, window: 300000 },          // 認証
];

// シンプルなインメモリレート制限（Edge対応）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  limit: number,
  window: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + window });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count < limit) {
    entry.count++;
    return { success: true, remaining: limit - entry.count };
  }

  return { success: false, remaining: 0 };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  return "unknown";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // APIレート制限チェック
  if (pathname.startsWith("/api/")) {
    const rateLimitConfig = rateLimitedPaths.find((cfg) =>
      pathname.startsWith(cfg.path)
    );

    if (rateLimitConfig) {
      const key = `${ip}:${rateLimitConfig.path}`;
      const result = checkRateLimit(
        key,
        rateLimitConfig.limit,
        rateLimitConfig.window
      );

      if (!result.success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests" }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }
  }

  // セッションCookieをチェック（楽観的認証チェック）
  const sessionCookie = getSessionCookie(request);

  // 保護されたルートへのアクセス
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionCookie) {
    // 未認証ユーザーはログインページへリダイレクト
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 認証済みユーザーが認証ページにアクセスした場合
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (isAuthRoute && sessionCookie) {
    // すでにログインしているユーザーはホームへリダイレクト
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 保護されたルート
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/admin/:path*",
    // 認証ルート
    "/signin",
    "/signup",
    "/forgot-password",
    // APIルート（レート制限用）
    "/api/:path*",
  ],
};
