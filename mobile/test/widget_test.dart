import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:newslingua_mobile/main.dart';

void main() {
  testWidgets('App should build', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: NewsLinguaApp(),
      ),
    );

    // アプリがビルドされることを確認
    expect(find.byType(NewsLinguaApp), findsOneWidget);
  });
}
