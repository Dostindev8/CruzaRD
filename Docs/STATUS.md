# Cruza RD — STATUS

**Updated:** 2026-07-26  
**Version:** 1.1.0 web

## Production

| Item | Value |
|------|--------|
| URL | https://cruza-rd.vercel.app |
| GitHub | https://github.com/Dostindev8/CruzaRD |
| Branch | `main` |
| Stack | React 19 + R3F + Zustand + Vite 6 · API Express (local) |

## Shipped in 1.1.0

- Street loot: clothes + weapons collectibles on track
- Satirical politician NPCs (Abinader, Danilo, Leonel, Omar F., Hipólito, Carolina M., Gonzalo) + **ELIMINAR** (1 street weapon)
- Full shop catalog (characters, backpacks, skateboards, clothes, weapons, coins, offers) + SVG icon library
- Animated runner (arm/leg cycle), deeper fog/lighting, splash SVG intro, spin offline fallback
- API: shop equip clothes/weapon · mission types `collect_clothes` / `defeat_politician` · Zod run payload extras · anti-cheat intact

## Verify

1. Open https://cruza-rd.vercel.app on mobile width
2. Play → collect ROPA/ARMA → press ELIMINAR near a politician label
3. Tienda → tabs ROPA/ARMAS → buy with soft coins (offline OK)
4. Giro diario works online or offline prize

## Notes

- Politicians are arcade caricatures, not photoreal likenesses
- Unity `Assets/_Project` and Flutter remain legacy (EXTEND-NEVER-OVERWRITE)
- Slim Vercel deploy excludes Unity Library / Flutter
