import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/domain/auth_provider.dart';

/// 設定画面
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.maybeWhen(
      data: (user) => user,
      orElse: () => null,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('設定'),
      ),
      body: ListView(
        children: [
          // アカウント設定セクション
          _SectionHeader(title: 'アカウント'),
          if (user != null) ...[
            _SettingsTile(
              icon: Icons.person_outline,
              title: 'プロフィール',
              subtitle: user.name ?? user.email,
              onTap: () {
                // プロフィール編集画面へ（将来実装）
              },
            ),
            _SettingsTile(
              icon: Icons.email_outlined,
              title: 'メールアドレス',
              subtitle: user.email,
              onTap: () {
                // メール変更画面へ（将来実装）
              },
            ),
          ] else ...[
            _SettingsTile(
              icon: Icons.login,
              title: 'サインイン',
              subtitle: 'アカウントにログインして同期を有効化',
              onTap: () => context.go('/signin'),
            ),
          ],
          const Divider(),

          // 学習設定セクション
          _SectionHeader(title: '学習設定'),
          _SettingsTile(
            icon: Icons.language,
            title: '学習言語',
            subtitle: '英語',
            onTap: () {
              _showLanguageSelector(context);
            },
          ),
          _SettingsTile(
            icon: Icons.translate,
            title: '母国語',
            subtitle: '日本語',
            onTap: () {
              _showNativeLanguageSelector(context);
            },
          ),
          _SettingsTile(
            icon: Icons.school_outlined,
            title: '学習レベル',
            subtitle: 'B1（中級）',
            onTap: () {
              _showLevelSelector(context);
            },
          ),
          const Divider(),

          // アプリ設定セクション
          _SectionHeader(title: 'アプリ設定'),
          _SettingsTile(
            icon: Icons.notifications_outlined,
            title: '通知',
            subtitle: '学習リマインダーの設定',
            onTap: () {
              // 通知設定画面へ（将来実装）
            },
          ),
          _SettingsTile(
            icon: Icons.dark_mode_outlined,
            title: 'ダークモード',
            subtitle: 'システム設定に従う',
            trailing: Switch(
              value: false,
              onChanged: (value) {
                // テーマ切り替え（将来実装）
              },
            ),
            onTap: () {},
          ),
          const Divider(),

          // その他セクション
          _SectionHeader(title: 'その他'),
          _SettingsTile(
            icon: Icons.help_outline,
            title: 'ヘルプ・使い方',
            onTap: () => context.go('/help'),
          ),
          _SettingsTile(
            icon: Icons.privacy_tip_outlined,
            title: 'プライバシーポリシー',
            onTap: () {
              // プライバシーポリシー表示（将来実装）
            },
          ),
          _SettingsTile(
            icon: Icons.description_outlined,
            title: '利用規約',
            onTap: () {
              // 利用規約表示（将来実装）
            },
          ),
          _SettingsTile(
            icon: Icons.info_outline,
            title: 'バージョン情報',
            subtitle: 'バージョン 1.0.0',
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: 'NewsLingua',
                applicationVersion: '1.0.0',
                applicationIcon: const Icon(
                  Icons.newspaper,
                  size: 48,
                  color: Colors.teal,
                ),
                children: const [
                  Text('ニュースを読みながら語学を学習できるアプリです。'),
                ],
              );
            },
          ),
          const Divider(),

          // サインアウト
          if (user != null)
            _SettingsTile(
              icon: Icons.logout,
              title: 'サインアウト',
              textColor: Colors.red,
              onTap: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('サインアウト'),
                    content: const Text('サインアウトしてもよろしいですか？'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('キャンセル'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.red,
                        ),
                        child: const Text('サインアウト'),
                      ),
                    ],
                  ),
                );

                if (confirm == true && context.mounted) {
                  await ref.read(authStateProvider.notifier).signOut();
                  if (context.mounted) {
                    context.go('/signin');
                  }
                }
              },
            ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '学習言語',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _LanguageOption(title: '英語', isSelected: true),
            _LanguageOption(title: 'スペイン語', isSelected: false),
            _LanguageOption(title: 'フランス語', isSelected: false),
            _LanguageOption(title: 'ドイツ語', isSelected: false),
            _LanguageOption(title: '中国語', isSelected: false),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showNativeLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '母国語',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _LanguageOption(title: '日本語', isSelected: true),
            _LanguageOption(title: '英語', isSelected: false),
            _LanguageOption(title: '中国語', isSelected: false),
            _LanguageOption(title: '韓国語', isSelected: false),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showLevelSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '学習レベル',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _LevelOption(level: 'A1', title: '初級（入門）', isSelected: false),
            _LevelOption(level: 'A2', title: '初級（基礎）', isSelected: false),
            _LevelOption(level: 'B1', title: '中級（初中級）', isSelected: true),
            _LevelOption(level: 'B2', title: '中級（上中級）', isSelected: false),
            _LevelOption(level: 'C1', title: '上級', isSelected: false),
            _LevelOption(level: 'C2', title: '上級（ネイティブレベル）', isSelected: false),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

/// セクションヘッダー
class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}

/// 設定項目タイル
class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final Color? textColor;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.textColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: textColor),
      title: Text(
        title,
        style: TextStyle(color: textColor),
      ),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: trailing ?? const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}

/// 言語オプション
class _LanguageOption extends StatelessWidget {
  final String title;
  final bool isSelected;

  const _LanguageOption({
    required this.title,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title),
      trailing: isSelected
          ? Icon(Icons.check, color: Theme.of(context).colorScheme.primary)
          : null,
      onTap: () => Navigator.pop(context),
    );
  }
}

/// レベルオプション
class _LevelOption extends StatelessWidget {
  final String level;
  final String title;
  final bool isSelected;

  const _LevelOption({
    required this.level,
    required this.title,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isSelected
              ? Theme.of(context).colorScheme.primary
              : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            level,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : Colors.grey.shade600,
            ),
          ),
        ),
      ),
      title: Text(title),
      trailing: isSelected
          ? Icon(Icons.check, color: Theme.of(context).colorScheme.primary)
          : null,
      onTap: () => Navigator.pop(context),
    );
  }
}

