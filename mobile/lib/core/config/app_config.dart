/// アプリケーション設定
class AppConfig {
  AppConfig._();

  /// API ベースURL（開発環境）
  static const String devApiBaseUrl = 'http://localhost:3000/api';

  /// API ベースURL（本番環境）
  static const String prodApiBaseUrl = 'https://newslingua.vercel.app/api';

  /// 現在の環境
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');

  /// 使用するベースURL
  static String get apiBaseUrl => isProduction ? prodApiBaseUrl : devApiBaseUrl;

  /// アプリ名
  static const String appName = 'NewsLingua';

  /// アプリバージョン
  static const String appVersion = '1.0.0';
}

