import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../domain/word_model.dart';

/// 単語帳リポジトリ Provider
final vocabularyRepositoryProvider = Provider<VocabularyRepository>((ref) {
  return VocabularyRepository(ref.read(apiClientProvider));
});

/// 単語帳リポジトリ
class VocabularyRepository {
  final ApiClient _apiClient;

  VocabularyRepository(this._apiClient);

  /// 単語一覧を取得
  Future<List<Word>> getWords() async {
    try {
      final response = await _apiClient.get('/words');
      if (response.data == null) {
        return [];
      }

      final words = (response.data as List)
          .map((json) => Word.fromJson(json as Map<String, dynamic>))
          .toList();

      return words;
    } catch (e) {
      throw Exception('単語の取得に失敗しました: $e');
    }
  }

  /// 単語を追加
  Future<Word> addWord(Word word) async {
    try {
      final response = await _apiClient.post(
        '/words',
        data: word.toJson(),
      );

      if (response.data == null) {
        throw Exception('単語の追加に失敗しました');
      }

      return Word.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('単語の追加に失敗しました: $e');
    }
  }

  /// 単語を更新
  Future<Word> updateWord(Word word) async {
    try {
      final response = await _apiClient.put(
        '/words/${word.id}',
        data: word.toJson(),
      );

      if (response.data == null) {
        throw Exception('単語の更新に失敗しました');
      }

      return Word.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('単語の更新に失敗しました: $e');
    }
  }

  /// 単語を削除
  Future<void> deleteWord(String id) async {
    try {
      await _apiClient.delete('/words/$id');
    } catch (e) {
      throw Exception('単語の削除に失敗しました: $e');
    }
  }

  /// チェックを更新
  Future<void> toggleCheck(String id, int checkNumber, bool value) async {
    try {
      await _apiClient.put(
        '/words/$id/check',
        data: {
          'checkNumber': checkNumber,
          'value': value,
        },
      );
    } catch (e) {
      throw Exception('チェックの更新に失敗しました: $e');
    }
  }
}

