import 'package:flutter/material.dart';
import '../constants/game_constants.dart';

/// Layout adaptativo phone → desktop (GDD v4 §04/§14).
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({
    super.key,
    required this.child,
    this.maxGameWidth = 520,
    this.showSidePanels = true,
  });

  final Widget child;
  final double maxGameWidth;
  final bool showSidePanels;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final device = ResponsiveBreakpoints.classify(width);

    switch (device) {
      case DeviceClass.phone:
      case DeviceClass.phoneLarge:
        return SafeArea(child: child);
      case DeviceClass.tablet:
        return SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxGameWidth + 80),
              child: child,
            ),
          ),
        );
      case DeviceClass.desktopSmall:
      case DeviceClass.desktopWide:
        if (!showSidePanels) {
          return SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxGameWidth),
                child: child,
              ),
            ),
          );
        }
        return SafeArea(
          child: Row(
            children: [
              const Expanded(child: _DecorPanel(side: _PanelSide.left)),
              ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxGameWidth),
                child: child,
              ),
              const Expanded(child: _DecorPanel(side: _PanelSide.right)),
            ],
          ),
        );
    }
  }
}

enum _PanelSide { left, right }

class _DecorPanel extends StatelessWidget {
  const _DecorPanel({required this.side});
  final _PanelSide side;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: side == _PanelSide.left ? Alignment.topLeft : Alignment.topRight,
          end: Alignment.bottomCenter,
          colors: const [
            Color(0x33002D62),
            Color(0x22CE1126),
            Colors.transparent,
          ],
        ),
        border: Border.all(color: const Color(0x33F5A623)),
      ),
      child: Center(
        child: Text(
          side == _PanelSide.left ? 'CRUZA\nRD' : '¡QUÍTATE\nDEL MEDIO!',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: const Color(0x66F7F4EE),
                height: 1.15,
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
    );
  }
}
