import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// 認証が必要なルート
const protectedRoutes = ["/dashboard", "/settings", "/profile"];

// 認証済みユーザーがアクセスできないルート（リダイレクト）
const authRoutes = ["/signin", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    // 認証ルート
    "/signin",
    "/signup",
    "/forgot-password",
  ],
};
