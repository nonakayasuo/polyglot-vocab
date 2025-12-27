import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/config/router.dart';
import 'core/config/theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: NewsLinguaApp(),
    ),
  );
}

/// NewsLingua アプリ
class NewsLinguaApp extends ConsumerWidget {
  const NewsLinguaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'NewsLingua',
      debugShowCheckedModeBanner: false,

      // テーマ
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,

      // ルーティング
      routerConfig: router,
    );
  }
}
