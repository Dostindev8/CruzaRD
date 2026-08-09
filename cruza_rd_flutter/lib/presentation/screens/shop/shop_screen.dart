import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/responsive/responsive_layout.dart';
import '../../../core/services/economy_service.dart';
import '../../../core/services/service_locator.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/juice_button.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final eco = sl<EconomyService>();
    final items = _catalog(_tab);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tienda'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/menu'),
        ),
      ),
      body: ResponsiveLayout(
        showSidePanels: false,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                children: [
                  _Currency(label: 'Papeletas', value: eco.papeletas),
                  const SizedBox(width: 12),
                  _Currency(label: 'Trofeos', value: eco.trofeos),
                ],
              ),
              const SizedBox(height: 16),
              SegmentedButton<int>(
                segments: const [
                  ButtonSegment(value: 0, label: Text('Personajes')),
                  ButtonSegment(value: 1, label: Text('Skins')),
                  ButtonSegment(value: 2, label: Text('Pase')),
                ],
                selected: {_tab},
                onSelectionChanged: (s) => setState(() => _tab = s.first),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.separated(
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    final item = items[i];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.panel,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              color: item.color,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(item.icon, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.name,
                                  style: GoogleFonts.fredoka(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  item.subtitle,
                                  style: const TextStyle(color: Colors.white60),
                                ),
                              ],
                            ),
                          ),
                          JuiceButton(
                            label: '${item.price}',
                            color: AppColors.gold,
                            onPressed: () async {
                              final ok = await eco.trySpendPapeletas(
                                item.price,
                                'shop_${item.id}',
                              );
                              if (!context.mounted) return;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    ok
                                        ? 'Comprado: ${item.name}'
                                        : 'Papeletas insuficientes',
                                  ),
                                ),
                              );
                              setState(() {});
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              Text(
                'Solo cosméticos — cero pay-to-win',
                style: GoogleFonts.nunito(color: Colors.white54, fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<_ShopItem> _catalog(int tab) {
    if (tab == 1) {
      return const [
        _ShopItem('skin_gorra', 'Gorra RD', 'Accesorio', 80, Icons.face, AppColors.flagBlue),
        _ShopItem('skin_mochila', 'Mochila RD', 'Accesorio', 120, Icons.backpack, AppColors.flagRed),
      ];
    }
    if (tab == 2) {
      return const [
        _ShopItem('pass_free', 'Pase gratuito', 'Track free', 0, Icons.card_giftcard, AppColors.tropicalGreen),
        _ShopItem('pass_premium', 'Pase premium', 'Track premium', 500, Icons.workspace_premium, AppColors.gold),
      ];
    }
    return const [
      _ShopItem('char_estudiante', 'Estudiante', 'Arquetipo original', 0, Icons.school, AppColors.caribbeanCyan),
      _ShopItem('char_motoconcho', 'Motoconchista', 'Arquetipo original', 150, Icons.two_wheeler, AppColors.flagRed),
      _ShopItem('char_colmadero', 'Colmadero', 'Arquetipo original', 200, Icons.storefront, AppColors.tropicalGreen),
    ];
  }
}

class _Currency extends StatelessWidget {
  const _Currency({required this.label, required this.value});
  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.panel,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(label, style: const TextStyle(color: Colors.white60)),
            Text(
              '$value',
              style: GoogleFonts.fredoka(color: AppColors.gold, fontSize: 22),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShopItem {
  const _ShopItem(this.id, this.name, this.subtitle, this.price, this.icon, this.color);
  final String id;
  final String name;
  final String subtitle;
  final int price;
  final IconData icon;
  final Color color;
}
