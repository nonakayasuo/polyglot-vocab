import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/news_repository.dart';
import 'article_model.dart';

/// 記事一覧 Provider
final articlesProvider = FutureProvider.autoDispose<List<Article>>((ref) async {
  final repository = ref.read(newsRepositoryProvider);
  return await repository.getArticles();
});

/// 検索キーワード Notifier
class SearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';

  void setQuery(String query) {
    state = query;
  }

  void clear() {
    state = '';
  }
}

/// 検索キーワード Provider
final searchQueryProvider = NotifierProvider<SearchQueryNotifier, String>(SearchQueryNotifier.new);

/// 検索結果 Provider
final searchResultsProvider =
    FutureProvider.autoDispose<List<Article>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) {
    return [];
  }
  final repository = ref.read(newsRepositoryProvider);
  return await repository.searchArticles(query);
});

/// 記事コンテンツ Provider
final articleContentProvider =
    FutureProvider.family.autoDispose<String, String>((ref, url) async {
  final repository = ref.read(newsRepositoryProvider);
  return await repository.getArticleContent(url);
});

/// 単語定義 Provider
final wordDefinitionProvider =
    FutureProvider.family.autoDispose<WordDefinition?, String>((ref, word) async {
  final repository = ref.read(newsRepositoryProvider);
  return await repository.getWordDefinition(word);
});

