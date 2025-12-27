import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/signin_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/news/presentation/news_list_screen.dart';
import '../../features/news/presentation/news_detail_screen.dart';
import '../../features/vocabulary/presentation/vocabulary_screen.dart';
import '../../features/flashcard/presentation/flashcard_screen.dart';
import '../../features/auth/domain/auth_provider.dart';

/// ルーター Provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/news',
    redirect: (context, state) {
      final isAuthenticated = authState.maybeWhen(
        data: (user) => user != null,
        orElse: () => false,
      );
      final isAuthRoute = state.matchedLocation == '/signin' ||
          state.matchedLocation == '/signup';

      // 未認証でも閲覧可能なルート
      final publicRoutes = ['/news', '/signin', '/signup'];
      final isPublicRoute = publicRoutes.any(
        (route) => state.matchedLocation.startsWith(route),
      );

      // 未認証で保護されたルートへアクセス
      if (!isAuthenticated && !isPublicRoute) {
        return '/signin';
      }

      // 認証済みで認証ルートへアクセス
      if (isAuthenticated && isAuthRoute) {
        return '/news';
      }

      return null;
    },
    routes: [
      // 認証
      GoRoute(
        path: '/signin',
        name: 'signin',
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/signup',
        name: 'signup',
        builder: (context, state) => const SignUpScreen(),
      ),

      // ニュース
      GoRoute(
        path: '/news',
        name: 'news',
        builder: (context, state) => const NewsListScreen(),
        routes: [
          GoRoute(
            path: ':id',
            name: 'news-detail',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              final extra = state.extra as Map<String, dynamic>?;
              return NewsDetailScreen(
                articleId: id,
                articleData: extra,
              );
            },
          ),
        ],
      ),

      // 単語帳
      GoRoute(
        path: '/vocabulary',
        name: 'vocabulary',
        builder: (context, state) => const VocabularyScreen(),
      ),

      // フラッシュカード
      GoRoute(
        path: '/flashcard',
        name: 'flashcard',
        builder: (context, state) => const FlashcardScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.matchedLocation}'),
      ),
    ),
  );
});

