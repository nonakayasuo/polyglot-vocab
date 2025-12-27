import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';
import 'user_model.dart';

/// 認証状態 Provider
final authStateProvider = AsyncNotifierProvider<AuthNotifier, User?>(() {
  return AuthNotifier();
});

/// 認証 Notifier
class AuthNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {
    // 起動時にセッションを確認
    return _checkSession();
  }

  Future<User?> _checkSession() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      return await repository.getSession();
    } catch (e) {
      return null;
    }
  }

  /// サインイン
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(authRepositoryProvider);
      return await repository.signIn(email: email, password: password);
    });
  }

  /// サインアップ
  Future<void> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(authRepositoryProvider);
      return await repository.signUp(
        name: name,
        email: email,
        password: password,
      );
    });
  }

  /// サインアウト
  Future<void> signOut() async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.signOut();
      state = const AsyncData(null);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}

