import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../vocabulary/domain/vocabulary_provider.dart';
import '../../vocabulary/domain/word_model.dart';
import '../../vocabulary/presentation/vocabulary_screen.dart';
import '../../../shared/widgets/app_drawer.dart';

/// フラッシュカード画面
class FlashcardScreen extends ConsumerStatefulWidget {
  const FlashcardScreen({super.key});

  @override
  ConsumerState<FlashcardScreen> createState() => _FlashcardScreenState();
}

class _FlashcardScreenState extends ConsumerState<FlashcardScreen> {
  int _currentIndex = 0;
  bool _showAnswer = false;
  List<Word> _shuffledWords = [];

  @override
  Widget build(BuildContext context) {
    final wordsAsync = ref.watch(wordsProvider);
    final selectedLanguage = ref.watch(selectedLanguageProvider);

    return Scaffold(
      appBar: AppBar(
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Text('フラッシュカード (${languageLabels[selectedLanguage] ?? selectedLanguage})'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shuffle),
            onPressed: () {
              if (_shuffledWords.isNotEmpty) {
                setState(() {
                  _shuffledWords.shuffle();
                  _currentIndex = 0;
                  _showAnswer = false;
                });
              }
            },
          ),
        ],
      ),
      drawer: const AppDrawer(),
      body: wordsAsync.when(
        data: (allWords) {
          // 選択中の言語でフィルタリング
          final words = allWords
              .where((w) => w.language == selectedLanguage)
              .toList();
          
          if (words.isEmpty) {
            return _buildEmptyState();
          }

          // 初回または単語が変わった時にシャッフル
          if (_shuffledWords.isEmpty ||
              !_shuffledWords.every((w) => words.any((aw) => aw.id == w.id))) {
            _shuffledWords = List.from(words)..shuffle();
            _currentIndex = 0;
          }

          final word = _shuffledWords[_currentIndex];

          return Column(
            children: [
              // 進捗表示
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${_currentIndex + 1} / ${_shuffledWords.length}',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),

              // フラッシュカード
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _showAnswer = !_showAnswer;
                      });
                    },
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      transitionBuilder: (child, animation) {
                        return FadeTransition(opacity: animation, child: child);
                      },
                      child: _buildCard(word),
                    ),
                  ),
                ),
              ),

              // ナビゲーションボタン
              Padding(
                padding: const EdgeInsets.all(24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // 前へ
                    IconButton(
                      onPressed: _currentIndex > 0
                          ? () {
                              setState(() {
                                _currentIndex--;
                                _showAnswer = false;
                              });
                            }
                          : null,
                      icon: const Icon(Icons.arrow_back),
                      iconSize: 32,
                    ),

                    // 覚えていない
                    ElevatedButton.icon(
                      onPressed: () {
                        _goToNext();
                      },
                      icon: const Icon(Icons.close),
                      label: const Text('まだ'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade400,
                      ),
                    ),

                    // 覚えた
                    ElevatedButton.icon(
                      onPressed: () {
                        // チェックを更新
                        final word = _shuffledWords[_currentIndex];
                        if (!word.check1) {
                          ref
                              .read(wordsProvider.notifier)
                              .toggleCheck(word.id, 1, true);
                        } else if (!word.check2) {
                          ref
                              .read(wordsProvider.notifier)
                              .toggleCheck(word.id, 2, true);
                        } else if (!word.check3) {
                          ref
                              .read(wordsProvider.notifier)
                              .toggleCheck(word.id, 3, true);
                        }
                        _goToNext();
                      },
                      icon: const Icon(Icons.check),
                      label: const Text('覚えた'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade400,
                      ),
                    ),

                    // 次へ
                    IconButton(
                      onPressed: _currentIndex < _shuffledWords.length - 1
                          ? () {
                              setState(() {
                                _currentIndex++;
                                _showAnswer = false;
                              });
                            }
                          : null,
                      icon: const Icon(Icons.arrow_forward),
                      iconSize: 32,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('エラー: $error')),
      ),
    );
  }

  Widget _buildCard(Word word) {
    return Card(
      key: ValueKey('${word.id}-$_showAnswer'),
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_showAnswer) ...[
              // 答え（意味）
              Text(
                word.meaning,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              if (word.example != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    word.example!,
                    style: TextStyle(
                      color: Colors.grey.shade700,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ] else ...[
              // 問題（単語）
              Text(
                word.word,
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (word.pronunciation != null) ...[
                const SizedBox(height: 12),
                Text(
                  word.pronunciation!,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 18,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color:
                      Theme.of(context).colorScheme.primary.withAlpha(30),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  word.category,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
            Text(
              _showAnswer ? 'タップして単語を表示' : 'タップして意味を表示',
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.style_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            'カードがありません',
            style: TextStyle(color: Colors.grey.shade600, fontSize: 18),
          ),
          const SizedBox(height: 8),
          const Text(
            '単語帳に単語を追加してください',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  void _goToNext() {
    if (_currentIndex < _shuffledWords.length - 1) {
      setState(() {
        _currentIndex++;
        _showAnswer = false;
      });
    } else {
      // 最後のカードの場合、完了ダイアログを表示
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('🎉 完了！'),
          content: const Text('すべてのカードを確認しました。'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _shuffledWords.shuffle();
                  _currentIndex = 0;
                  _showAnswer = false;
                });
              },
              child: const Text('もう一度'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('終了'),
            ),
          ],
        ),
      );
    }
  }
}

