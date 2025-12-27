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
      // まずトークンがあるか確認
      final token = await _apiClient.getToken();
      if (token == null) {
        return null;
      }
      
      final response = await _apiClient.get('/auth/get-session');
      if (response.data != null && response.data['user'] != null) {
        return User.fromJson(response.data['user'] as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      // トークンが無効な場合はクリア
      await _apiClient.clearToken();
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

    if (response.data == null) {
      throw Exception('サインインに失敗しました');
    }

    // Better Auth Bearer プラグインのレスポンス形式に対応
    // token または session.token からトークンを取得
    String? token;
    if (response.data['token'] != null) {
      token = response.data['token'] as String;
    } else if (response.data['session'] != null && 
               response.data['session']['token'] != null) {
      token = response.data['session']['token'] as String;
    }
    
    if (token != null) {
      await _apiClient.saveToken(token);
    }

    // ユーザー情報を取得
    User? user;
    if (response.data['user'] != null) {
      user = User.fromJson(response.data['user'] as Map<String, dynamic>);
    } else {
      throw Exception('サインインに失敗しました: ユーザー情報がありません');
    }

    return user;
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

    if (response.data == null) {
      throw Exception('アカウント作成に失敗しました');
    }

    // トークンを保存
    String? token;
    if (response.data['token'] != null) {
      token = response.data['token'] as String;
    } else if (response.data['session'] != null && 
               response.data['session']['token'] != null) {
      token = response.data['session']['token'] as String;
    }
    
    if (token != null) {
      await _apiClient.saveToken(token);
    }

    // ユーザー情報を取得
    User? user;
    if (response.data['user'] != null) {
      user = User.fromJson(response.data['user'] as Map<String, dynamic>);
    } else {
      throw Exception('アカウント作成に失敗しました: ユーザー情報がありません');
    }

    return user;
  }

  /// サインアウト
  Future<void> signOut() async {
    try {
      await _apiClient.post('/auth/sign-out');
    } finally {
      await _apiClient.clearToken();
    }
  }
  
  /// Google OAuth URL を取得
  String getGoogleSignInUrl() {
    return '${_apiClient.baseUrl}/api/auth/sign-in/social?provider=google&callbackURL=${Uri.encodeComponent("${_apiClient.baseUrl}/")}';
  }
  
  /// Facebook OAuth URL を取得  
  String getFacebookSignInUrl() {
    return '${_apiClient.baseUrl}/api/auth/sign-in/social?provider=facebook&callbackURL=${Uri.encodeComponent("${_apiClient.baseUrl}/")}';
  }
}
