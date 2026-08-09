import 'package:go_router/go_router.dart';

import 'presentation/screens/gameplay/gameplay_screen.dart';
import 'presentation/screens/menu/main_menu_screen.dart';
import 'presentation/screens/settings/settings_screen.dart';
import 'presentation/screens/shop/shop_screen.dart';
import 'presentation/screens/splash/splash_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/menu', builder: (_, __) => const MainMenuScreen()),
    GoRoute(path: '/game', builder: (_, __) => const GameplayScreen()),
    GoRoute(path: '/shop', builder: (_, __) => const ShopScreen()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
  ],
);
