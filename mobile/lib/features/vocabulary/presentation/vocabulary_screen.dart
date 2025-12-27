import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/vocabulary_provider.dart';
import '../domain/word_model.dart';
import '../../../shared/widgets/app_drawer.dart';

/// 言語設定
const Map<String, String> languageLabels = {
  'english': '英語',
  'spanish': 'スペイン語',
  'korean': '韓国語',
  'chinese': '中国語',
  'french': 'フランス語',
  'german': 'ドイツ語',
  'japanese': '日本語',
};

/// 選択中の言語 Provider
class SelectedLanguageNotifier extends Notifier<String> {
  @override
  String build() => 'english';

  void setLanguage(String language) {
    state = language;
  }
}

final selectedLanguageProvider =
    NotifierProvider<SelectedLanguageNotifier, String>(
        SelectedLanguageNotifier.new);

/// 単語帳画面
class VocabularyScreen extends ConsumerWidget {
  const VocabularyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wordsAsync = ref.watch(wordsProvider);
    final currentFilter = ref.watch(wordFilterProvider);
    final selectedLanguage = ref.watch(selectedLanguageProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('単語帳'),
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      drawer: const AppDrawer(),
      body: wordsAsync.when(
        data: (allWords) {
          // 利用可能な言語を取得
          final availableLanguages = allWords
              .map((w) => w.language)
              .toSet()
              .toList();
          
          // 選択中の言語でフィルタリング
          var words = allWords
              .where((w) => w.language == selectedLanguage)
              .toList();

          // さらにステータスでフィルタリング
          switch (currentFilter) {
            case WordFilter.mastered:
              words = words.where((w) => w.isMastered).toList();
              break;
            case WordFilter.learning:
              words = words
                  .where((w) => !w.isMastered && w.masteryLevel > 0)
                  .toList();
              break;
            case WordFilter.notStarted:
              words = words.where((w) => w.masteryLevel == 0).toList();
              break;
            case WordFilter.all:
              break;
          }

          // 言語別の統計
          final languageStats = <String, Map<String, int>>{};
          for (final lang in availableLanguages) {
            final langWords =
                allWords.where((w) => w.language == lang).toList();
            languageStats[lang] = {
              'total': langWords.length,
              'mastered': langWords.where((w) => w.isMastered).length,
              'learning': langWords
                  .where((w) => !w.isMastered && w.masteryLevel > 0)
                  .length,
              'notStarted': langWords.where((w) => w.masteryLevel == 0).length,
            };
          }

          return Column(
            children: [
              // 言語タブ
              if (availableLanguages.length > 1)
                Container(
                  height: 50,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: availableLanguages.length,
                    itemBuilder: (context, index) {
                      final lang = availableLanguages[index];
                      final isSelected = lang == selectedLanguage;
                      final stats = languageStats[lang]!;

                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ChoiceChip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(languageLabels[lang] ?? lang),
                              const SizedBox(width: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? Colors.white.withAlpha(50)
                                      : Theme.of(context)
                                          .colorScheme
                                          .primary
                                          .withAlpha(30),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${stats['total']}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isSelected
                                        ? Colors.white
                                        : Theme.of(context).colorScheme.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              ref
                                  .read(selectedLanguageProvider.notifier)
                                  .setLanguage(lang);
                            }
                          },
                        ),
                      );
                    },
                  ),
                ),

              // 統計バー
              _StatisticsBar(
                total: words.length,
                mastered: words.where((w) => w.isMastered).length,
                learning: words
                    .where((w) => !w.isMastered && w.masteryLevel > 0)
                    .length,
                notStarted: words.where((w) => w.masteryLevel == 0).length,
              ),

              // フィルタータブ
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _FilterChip(
                        label: 'すべて',
                        isSelected: currentFilter == WordFilter.all,
                        onTap: () => ref
                            .read(wordFilterProvider.notifier)
                            .setFilter(WordFilter.all),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: '習得済み ✨',
                        isSelected: currentFilter == WordFilter.mastered,
                        onTap: () => ref
                            .read(wordFilterProvider.notifier)
                            .setFilter(WordFilter.mastered),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: '学習中',
                        isSelected: currentFilter == WordFilter.learning,
                        onTap: () => ref
                            .read(wordFilterProvider.notifier)
                            .setFilter(WordFilter.learning),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: '未着手',
                        isSelected: currentFilter == WordFilter.notStarted,
                        onTap: () => ref
                            .read(wordFilterProvider.notifier)
                            .setFilter(WordFilter.notStarted),
                      ),
                    ],
                  ),
                ),
              ),

              // 単語一覧
              Expanded(
                child: words.isEmpty
                    ? _buildEmptyState(context, selectedLanguage, allWords.isEmpty)
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: words.length,
                        itemBuilder: (context, index) {
                          return _WordCard(
                            word: words[index],
                            onCheckToggle: (checkNumber, value) {
                              ref.read(wordsProvider.notifier).toggleCheck(
                                    words[index].id,
                                    checkNumber,
                                    value,
                                  );
                            },
                          );
                        },
                      ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('エラー: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(wordsProvider),
                child: const Text('再試行'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, String language, bool noWordsAtAll) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.book_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            noWordsAtAll
                ? '単語がありません'
                : '${languageLabels[language] ?? language}の単語がありません',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'ニュース記事から単語を追加しましょう',
            style: TextStyle(color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }
}

/// 統計バー
class _StatisticsBar extends StatelessWidget {
  final int total;
  final int mastered;
  final int learning;
  final int notStarted;

  const _StatisticsBar({
    required this.total,
    required this.mastered,
    required this.learning,
    required this.notStarted,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _StatItem(
            label: '合計',
            value: total,
            color: Theme.of(context).colorScheme.primary,
          ),
          _StatItem(
            label: '習得済み',
            value: mastered,
            color: Colors.green,
          ),
          _StatItem(
            label: '学習中',
            value: learning,
            color: Colors.orange,
          ),
          _StatItem(
            label: '未着手',
            value: notStarted,
            color: Colors.grey,
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          '$value',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}

/// フィルターチップ
class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? Theme.of(context).colorScheme.primary
              : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey.shade700,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

/// 単語カード
class _WordCard extends StatelessWidget {
  final Word word;
  final Function(int, bool) onCheckToggle;

  const _WordCard({
    required this.word,
    required this.onCheckToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 単語と発音
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        word.word,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (word.pronunciation != null &&
                          word.pronunciation!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          word.pronunciation!,
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                // 品詞バッジ
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary.withAlpha(30),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    word.category,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 意味
            Text(
              word.meaning,
              style: const TextStyle(fontSize: 16),
            ),

            // 例文
            if (word.example != null && word.example!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  word.example!,
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 12),

            // チェックボックス
            Row(
              children: [
                _CheckButton(
                  number: 1,
                  isChecked: word.check1,
                  onTap: () => onCheckToggle(1, !word.check1),
                ),
                const SizedBox(width: 8),
                _CheckButton(
                  number: 2,
                  isChecked: word.check2,
                  onTap: () => onCheckToggle(2, !word.check2),
                ),
                const SizedBox(width: 8),
                _CheckButton(
                  number: 3,
                  isChecked: word.check3,
                  onTap: () => onCheckToggle(3, !word.check3),
                ),
                const Spacer(),
                // 習得レベル表示
                Text(
                  word.isMastered ? '習得済み ✨' : '${word.masteryLevel}/3',
                  style: TextStyle(
                    color:
                        word.isMastered ? Colors.green : Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// チェックボタン
class _CheckButton extends StatelessWidget {
  final int number;
  final bool isChecked;
  final VoidCallback onTap;

  const _CheckButton({
    required this.number,
    required this.isChecked,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isChecked
              ? Theme.of(context).colorScheme.primary
              : Colors.grey.shade200,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: isChecked
              ? const Icon(Icons.check, color: Colors.white, size: 18)
              : Text(
                  '$number',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.bold,
                  ),
                ),
        ),
      ),
    );
  }
}
