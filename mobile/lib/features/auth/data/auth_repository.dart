import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../domain/user_model.dart';

/// 認証リポジトリ Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(apiClientProvider));
});

/// 認証リポジトリ
class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  /// セッション確認
  Future<User?> getSession() async {
    try {
      final response = await _apiClient.get('/auth/get-session');
      if (response.data != null && response.data['user'] != null) {
        return User.fromJson(response.data['user'] as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// サインイン
  Future<User> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/auth/sign-in/email',
      data: {
        'email': email,
        'password': password,
      },
    );

    if (response.data == null || response.data['user'] == null) {
      throw Exception('サインインに失敗しました');
    }

    // トークンを保存（レスポンスにトークンがある場合）
    if (response.data['token'] != null) {
      await _apiClient.saveToken(response.data['token'] as String);
    }

    return User.fromJson(response.data['user'] as Map<String, dynamic>);
  }

  /// サインアップ
  Future<User> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/auth/sign-up/email',
      data: {
        'name': name,
        'email': email,
        'password': password,
      },
    );

    if (response.data == null || response.data['user'] == null) {
      throw Exception('アカウント作成に失敗しました');
    }

    // トークンを保存
    if (response.data['token'] != null) {
      await _apiClient.saveToken(response.data['token'] as String);
    }

    return User.fromJson(response.data['user'] as Map<String, dynamic>);
  }

  /// サインアウト
  Future<void> signOut() async {
    try {
      await _apiClient.post('/auth/sign-out');
    } finally {
      await _apiClient.clearToken();
    }
  }
}

