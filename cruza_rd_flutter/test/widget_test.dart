import 'package:cruza_rd/presentation/widgets/juice_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('JuiceButton renders label', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: JuiceButton(label: 'JUGAR', onPressed: () {}),
        ),
      ),
    );
    expect(find.text('JUGAR'), findsOneWidget);
  });
}
