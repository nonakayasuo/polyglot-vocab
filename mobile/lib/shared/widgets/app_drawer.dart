import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/domain/auth_provider.dart';

/// アプリドロワー（ハンバーガーメニュー）
class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.maybeWhen(
      data: (user) => user,
      orElse: () => null,
    );

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // ヘッダー
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).colorScheme.primary,
                    Theme.of(context).colorScheme.primary.withAlpha(200),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.newspaper,
                    size: 48,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'NewsLingua',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user != null
                        ? user.name ?? user.email
                        : 'ゲストユーザー',
                    style: TextStyle(
                      color: Colors.white.withAlpha(200),
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),

            // メニュー項目
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _DrawerItem(
                    icon: Icons.newspaper,
                    title: 'ニュース',
                    subtitle: '記事を読んで学習',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/news');
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.book,
                    title: '単語帳',
                    subtitle: '保存した単語を復習',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/vocabulary');
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.style,
                    title: 'フラッシュカード',
                    subtitle: 'カードで効率的に暗記',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/flashcard');
                    },
                  ),
                  const Divider(),
                  _DrawerItem(
                    icon: Icons.settings,
                    title: '設定',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/settings');
                    },
                  ),
                  _DrawerItem(
                    icon: Icons.help_outline,
                    title: 'ヘルプ・使い方',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/help');
                    },
                  ),
                ],
              ),
            ),

            // フッター
            const Divider(height: 1),
            if (user != null)
              _DrawerItem(
                icon: Icons.logout,
                title: 'サインアウト',
                onTap: () async {
                  Navigator.pop(context);
                  await ref.read(authStateProvider.notifier).signOut();
                  if (context.mounted) {
                    context.go('/signin');
                  }
                },
              )
            else
              _DrawerItem(
                icon: Icons.login,
                title: 'サインイン',
                onTap: () {
                  Navigator.pop(context);
                  context.go('/signin');
                },
              ),
          ],
        ),
      ),
    );
  }
}

/// ドロワーメニュー項目
class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _DrawerItem({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      onTap: onTap,
    );
  }
}

