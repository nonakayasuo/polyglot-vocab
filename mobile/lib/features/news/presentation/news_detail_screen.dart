import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:uuid/uuid.dart';
import '../domain/news_provider.dart';
import '../domain/article_model.dart';
import '../../../shared/widgets/word_popup.dart';
import '../../vocabulary/domain/vocabulary_provider.dart';
import '../../vocabulary/domain/word_model.dart';

/// ニュース詳細画面
class NewsDetailScreen extends ConsumerStatefulWidget {
  final String articleId;
  final Map<String, dynamic>? articleData;

  const NewsDetailScreen({
    super.key,
    required this.articleId,
    this.articleData,
  });

  @override
  ConsumerState<NewsDetailScreen> createState() => _NewsDetailScreenState();
}

class _NewsDetailScreenState extends ConsumerState<NewsDetailScreen> {
  Article? _article;
  String? _selectedWord;
  Offset? _popupPosition;

  @override
  void initState() {
    super.initState();
    if (widget.articleData != null) {
      _article = Article.fromJson(widget.articleData!);
    }
  }

  void _onWordTap(String word, Offset position) {
    final cleanWord = word.replaceAll(RegExp(r'[^a-zA-Z]'), '').toLowerCase();
    if (cleanWord.length < 2) return;

    setState(() {
      _selectedWord = cleanWord;
      _popupPosition = position;
    });
  }

  void _closePopup() {
    setState(() {
      _selectedWord = null;
      _popupPosition = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_article == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('記事が見つかりません')),
      );
    }

    final contentAsync = ref.watch(
      articleContentProvider(_article!.url),
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(_article!.source),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_browser),
            onPressed: () async {
              final url = Uri.parse(_article!.url);
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // メインコンテンツ
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 画像
                if (_article!.imageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      _article!.imageUrl!,
                      width: double.infinity,
                      height: 200,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stack) {
                        return Container(
                          height: 200,
                          color: Colors.grey.shade200,
                          child: const Center(
                            child: Icon(Icons.image_not_supported, size: 48),
                          ),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: 16),

                // タイトル
                Text(
                  _article!.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),

                // メタ情報
                Row(
                  children: [
                    Icon(Icons.source, size: 16, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(
                      _article!.source,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                    const SizedBox(width: 16),
                    if (_article!.publishedAt != null) ...[
                      Icon(Icons.access_time,
                          size: 16, color: Colors.grey.shade600),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(_article!.publishedAt!),
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 24),

                // 記事本文
                contentAsync.when(
                  data: (content) {
                    if (content.isEmpty) {
                      return _buildDescription();
                    }
                    return _buildClickableContent(content);
                  },
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  error: (error, stack) => _buildDescription(),
                ),
              ],
            ),
          ),

          // 単語ポップアップ
          if (_selectedWord != null && _popupPosition != null)
            WordPopup(
              word: _selectedWord!,
              position: _popupPosition!,
              onClose: _closePopup,
              onAddToVocabulary: (definition) async {
                // WordDefinitionからWordに変換して追加
                final word = Word(
                  id: const Uuid().v4(),
                  word: definition.word,
                  pronunciation: definition.phonetic,
                  category: definition.partOfSpeech ?? 'Other',
                  meaning: definition.definitionJa ?? definition.definition ?? '',
                  example: definition.example,
                  language: 'english',
                );

                try {
                  await ref.read(wordsProvider.notifier).addWord(word);
                  _closePopup();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('"${definition.word}" を単語帳に追加しました'),
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                } catch (e) {
                  _closePopup();
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('単語の追加に失敗しました: $e'),
                        backgroundColor: Colors.red,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                }
              },
            ),
        ],
      ),
    );
  }

  Widget _buildDescription() {
    if (_article!.description == null) {
      return const SizedBox.shrink();
    }
    return _buildClickableContent(_article!.description!);
  }

  Widget _buildClickableContent(String content) {
    final words = content.split(RegExp(r'(\s+)'));

    return Wrap(
      children: words.map((word) {
        if (word.trim().isEmpty) {
          return Text(word);
        }
        return GestureDetector(
          onTapUp: (details) {
            _onWordTap(word, details.globalPosition);
          },
          child: Text(
            word,
            style: const TextStyle(
              fontSize: 16,
              height: 1.8,
            ),
          ),
        );
      }).toList(),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}/${date.month}/${date.day}';
  }
}

