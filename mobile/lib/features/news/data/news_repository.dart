import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../domain/article_model.dart';

/// ニュースリポジトリ Provider
final newsRepositoryProvider = Provider<NewsRepository>((ref) {
  return NewsRepository(ref.read(apiClientProvider));
});

/// ニュースリポジトリ
class NewsRepository {
  final ApiClient _apiClient;

  NewsRepository(this._apiClient);

  /// 記事一覧を取得
  Future<List<Article>> getArticles({
    String? category,
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '/news',
        queryParameters: {
          if (category != null) 'category': category,
          'page': page,
          'pageSize': pageSize,
        },
      );

      if (response.data == null) {
        return [];
      }

      final articles = (response.data['articles'] as List?)
              ?.map((json) => Article.fromJson(json as Map<String, dynamic>))
              .toList() ??
          [];

      return articles;
    } on DioException catch (e) {
      throw Exception('記事の取得に失敗しました: ${e.message}');
    }
  }

  /// 記事を検索
  Future<List<Article>> searchArticles(String query) async {
    try {
      final response = await _apiClient.get(
        '/news',
        queryParameters: {'q': query},
      );

      if (response.data == null) {
        return [];
      }

      final articles = (response.data['articles'] as List?)
              ?.map((json) => Article.fromJson(json as Map<String, dynamic>))
              .toList() ??
          [];

      return articles;
    } on DioException catch (e) {
      throw Exception('検索に失敗しました: ${e.message}');
    }
  }

  /// 記事の全文を取得
  Future<String> getArticleContent(String url) async {
    try {
      final response = await _apiClient.get(
        '/news/content',
        queryParameters: {'url': url},
      );

      if (response.data == null) {
        return '';
      }

      return response.data['content'] as String? ?? '';
    } on DioException catch (e) {
      throw Exception('記事の取得に失敗しました: ${e.message}');
    }
  }

  /// 単語の定義を取得
  Future<WordDefinition?> getWordDefinition(String word) async {
    try {
      // Free Dictionary API を直接使用
      final dio = Dio();
      final response = await dio.get(
        'https://api.dictionaryapi.dev/api/v2/entries/en/$word',
      );

      if (response.data == null || (response.data as List).isEmpty) {
        return null;
      }

      final entry = response.data[0] as Map<String, dynamic>;
      final meanings = entry['meanings'] as List?;
      final meaning = meanings?.isNotEmpty == true ? meanings![0] : null;
      final definitions = meaning?['definitions'] as List?;
      final definition =
          definitions?.isNotEmpty == true ? definitions![0] : null;

      // 発音記号を取得
      String? phonetic = entry['phonetic'] as String?;
      if (phonetic == null) {
        final phonetics = entry['phonetics'] as List?;
        if (phonetics != null && phonetics.isNotEmpty) {
          for (final p in phonetics) {
            if (p['text'] != null) {
              phonetic = p['text'] as String?;
              break;
            }
          }
        }
      }

      // 日本語訳を取得（翻訳API使用）
      String? definitionJa;
      final englishDef = definition?['definition'] as String?;
      if (englishDef != null) {
        try {
          final translateResponse = await _apiClient.get(
            '/translate',
            queryParameters: {
              'text': englishDef,
              'from': 'en',
              'to': 'ja',
            },
          );
          definitionJa = translateResponse.data?['translatedText'] as String?;
        } catch (_) {
          // 翻訳失敗は無視
        }
      }

      return WordDefinition(
        word: entry['word'] as String? ?? word,
        phonetic: phonetic,
        partOfSpeech: meaning?['partOfSpeech'] as String?,
        definition: englishDef,
        definitionJa: definitionJa,
        example: definition?['example'] as String?,
      );
    } on DioException {
      return null;
    }
  }
}

