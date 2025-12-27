import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// ヘルプ・使い方画面
class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ヘルプ・使い方'),
      ),
      body: ListView(
        children: [
          // ヘッダーイメージ
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
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
            child: const Column(
              children: [
                Icon(
                  Icons.newspaper,
                  size: 64,
                  color: Colors.white,
                ),
                SizedBox(height: 16),
                Text(
                  'NewsLinguaへようこそ！',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'ニュースを読みながら語学を学習',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),

          // 使い方セクション
          const _SectionTitle(title: '📚 使い方'),
          _HelpCard(
            icon: Icons.article_outlined,
            title: 'ニュースを読む',
            description:
                'ホーム画面で興味のあるニュース記事を選んでタップしてください。記事は難易度順に並び替えることもできます。',
          ),
          _HelpCard(
            icon: Icons.touch_app_outlined,
            title: '単語をタップ',
            description:
                '記事を読んでいて分からない単語があれば、その単語をタップしてください。意味と発音が表示されます。',
          ),
          _HelpCard(
            icon: Icons.bookmark_add_outlined,
            title: '単語帳に保存',
            description:
                '覚えたい単語は「単語帳に追加」ボタンで保存できます。後から復習することができます。',
          ),
          _HelpCard(
            icon: Icons.style_outlined,
            title: 'フラッシュカードで復習',
            description:
                '保存した単語はフラッシュカード形式で効率的に復習できます。カードをスワイプして覚えた/まだを選択してください。',
          ),

          // 機能紹介セクション
          const _SectionTitle(title: '✨ 主な機能'),
          _FeatureCard(
            icon: Icons.trending_up,
            title: '難易度表示',
            description: '各記事にはCEFRレベル（A1〜C2）が表示され、自分のレベルに合った記事を選べます。',
            color: Colors.blue,
          ),
          _FeatureCard(
            icon: Icons.translate,
            title: '単語の翻訳',
            description: '単語をタップすると、日本語訳・発音・例文が表示されます。',
            color: Colors.green,
          ),
          _FeatureCard(
            icon: Icons.bar_chart,
            title: '学習進捗',
            description: '学習した単語数や読んだ記事数を追跡できます。',
            color: Colors.orange,
          ),
          _FeatureCard(
            icon: Icons.cloud_sync_outlined,
            title: 'クラウド同期',
            description: 'ログインすると、複数のデバイスで学習データを同期できます。',
            color: Colors.purple,
          ),

          // よくある質問セクション
          const _SectionTitle(title: '❓ よくある質問'),
          _FAQItem(
            question: 'オフラインでも使えますか？',
            answer: 'はい、一度読み込んだ記事や保存した単語はオフラインでも閲覧できます。ただし、新しい記事の取得にはインターネット接続が必要です。',
          ),
          _FAQItem(
            question: '対応している言語は？',
            answer: '現在、英語の学習に対応しています。今後、スペイン語やフランス語なども追加予定です。',
          ),
          _FAQItem(
            question: '学習データは保存されますか？',
            answer: 'ログインしていれば、学習データはクラウドに保存され、他のデバイスでも利用できます。ゲストモードではデバイス内にのみ保存されます。',
          ),
          _FAQItem(
            question: '有料機能はありますか？',
            answer: '基本機能はすべて無料でご利用いただけます。プレミアム機能（広告なし、AI解説など）は有料プランでご利用いただけます。',
          ),

          // お問い合わせセクション
          const _SectionTitle(title: '📬 お問い合わせ'),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ご質問やご意見がございましたら、お気軽にお問い合わせください。',
                      style: TextStyle(fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final uri = Uri(
                            scheme: 'mailto',
                            path: 'support@newslingua.app',
                            query: 'subject=NewsLinguaへのお問い合わせ',
                          );
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri);
                          }
                        },
                        icon: const Icon(Icons.email_outlined),
                        label: const Text('メールで問い合わせ'),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final uri = Uri.parse('https://newslingua.app');
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(
                              uri,
                              mode: LaunchMode.externalApplication,
                            );
                          }
                        },
                        icon: const Icon(Icons.language),
                        label: const Text('公式サイトを開く'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

/// セクションタイトル
class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

/// ヘルプカード
class _HelpCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _HelpCard({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withAlpha(30),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// 機能カード
class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Color color;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withAlpha(30),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// FAQアイテム
class _FAQItem extends StatelessWidget {
  final String question;
  final String answer;

  const _FAQItem({
    required this.question,
    required this.answer,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ExpansionTile(
        title: Text(
          question,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(
              answer,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

