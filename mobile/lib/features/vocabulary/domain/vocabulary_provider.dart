import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/vocabulary_repository.dart';
import 'word_model.dart';

/// 単語一覧 Provider
final wordsProvider = AsyncNotifierProvider<WordsNotifier, List<Word>>(() {
  return WordsNotifier();
});

/// 単語 Notifier
class WordsNotifier extends AsyncNotifier<List<Word>> {
  @override
  Future<List<Word>> build() async {
    return _fetchWords();
  }

  Future<List<Word>> _fetchWords() async {
    final repository = ref.read(vocabularyRepositoryProvider);
    return await repository.getWords();
  }

  /// 単語を追加
  Future<void> addWord(Word word) async {
    final repository = ref.read(vocabularyRepositoryProvider);
    await repository.addWord(word);
    ref.invalidateSelf();
  }

  /// 単語を更新
  Future<void> updateWord(Word word) async {
    final repository = ref.read(vocabularyRepositoryProvider);
    await repository.updateWord(word);
    ref.invalidateSelf();
  }

  /// 単語を削除
  Future<void> deleteWord(String id) async {
    final repository = ref.read(vocabularyRepositoryProvider);
    await repository.deleteWord(id);
    ref.invalidateSelf();
  }

  /// チェックを更新
  Future<void> toggleCheck(String id, int checkNumber, bool value) async {
    final repository = ref.read(vocabularyRepositoryProvider);
    await repository.toggleCheck(id, checkNumber, value);
    ref.invalidateSelf();
  }
}

/// フィルタリングされた単語一覧
final filteredWordsProvider = Provider<AsyncValue<List<Word>>>((ref) {
  final wordsAsync = ref.watch(wordsProvider);
  final filter = ref.watch(wordFilterProvider);

  if (wordsAsync.isLoading) {
    return const AsyncValue.loading();
  }
  
  if (wordsAsync.hasError) {
    return AsyncValue.error(wordsAsync.error!, wordsAsync.stackTrace!);
  }
  
  final words = wordsAsync.value ?? [];
  
  switch (filter) {
    case WordFilter.all:
      return AsyncValue.data(words);
    case WordFilter.mastered:
      return AsyncValue.data(words.where((w) => w.isMastered).toList());
    case WordFilter.learning:
      return AsyncValue.data(words.where((w) => !w.isMastered && w.masteryLevel > 0).toList());
    case WordFilter.notStarted:
      return AsyncValue.data(words.where((w) => w.masteryLevel == 0).toList());
  }
});

/// フィルター状態
enum WordFilter { all, mastered, learning, notStarted }

/// フィルター Notifier
class WordFilterNotifier extends Notifier<WordFilter> {
  @override
  WordFilter build() => WordFilter.all;

  void setFilter(WordFilter filter) {
    state = filter;
  }
}

final wordFilterProvider = NotifierProvider<WordFilterNotifier, WordFilter>(WordFilterNotifier.new);

