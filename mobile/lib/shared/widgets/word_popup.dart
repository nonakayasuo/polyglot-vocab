import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/news/domain/news_provider.dart';
import '../../features/news/domain/article_model.dart';

/// 単語ポップアップ
class WordPopup extends ConsumerWidget {
  final String word;
  final Offset position;
  final VoidCallback onClose;
  final Function(WordDefinition) onAddToVocabulary;

  const WordPopup({
    super.key,
    required this.word,
    required this.position,
    required this.onClose,
    required this.onAddToVocabulary,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final definitionAsync = ref.watch(wordDefinitionProvider(word));
    final screenSize = MediaQuery.of(context).size;

    // ポップアップの位置を調整
    double left = position.dx - 150;
    if (left < 16) left = 16;
    if (left > screenSize.width - 316) left = screenSize.width - 316;

    double top = position.dy + 20;
    if (top > screenSize.height - 300) {
      top = position.dy - 220;
    }

    return Stack(
      children: [
        // 背景（タップで閉じる）
        GestureDetector(
          onTap: onClose,
          child: Container(
            color: Colors.black.withAlpha(50),
          ),
        ),

        // ポップアップ
        Positioned(
          left: left,
          top: top,
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              width: 300,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: definitionAsync.when(
                data: (definition) {
                  if (definition == null) {
                    return _buildNotFound();
                  }
                  return _buildContent(context, definition);
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (error, stack) => _buildNotFound(),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNotFound() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.search_off, size: 48, color: Colors.grey.shade400),
        const SizedBox(height: 8),
        Text(
          '"$word" の定義が見つかりません',
          style: TextStyle(color: Colors.grey.shade600),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildContent(BuildContext context, WordDefinition definition) {
    return Column(
      mainAxisSize: MainAxisSize.min,
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
                    definition.word,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (definition.phonetic != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      definition.phonetic!,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            // 閉じるボタン
            IconButton(
              icon: const Icon(Icons.close, size: 20),
              onPressed: onClose,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),

        // 品詞
        if (definition.partOfSpeech != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withAlpha(30),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              definition.partOfSpeech!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontSize: 12,
              ),
            ),
          ),
        ],

        const SizedBox(height: 12),

        // 日本語訳
        if (definition.definitionJa != null) ...[
          Text(
            definition.definitionJa!,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 8),
        ],

        // 英語定義
        if (definition.definition != null) ...[
          Text(
            definition.definition!,
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
        ],

        // 例文
        if (definition.example != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              definition.example!,
              style: TextStyle(
                color: Colors.grey.shade700,
                fontStyle: FontStyle.italic,
                fontSize: 13,
              ),
            ),
          ),
        ],

        const SizedBox(height: 16),

        // 単語帳に追加ボタン
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () => onAddToVocabulary(definition),
            icon: const Icon(Icons.add, size: 18),
            label: const Text('単語帳に追加'),
          ),
        ),
      ],
    );
  }
}

