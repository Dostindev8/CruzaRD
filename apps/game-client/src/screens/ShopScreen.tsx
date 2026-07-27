import { useMemo, useState } from 'react';
import type { ShopCategory, ShopItem } from '@cruza-rd/shared-types';
import { FULL_SHOP_CATALOG } from '../data/catalog';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { IconChicken, IconCoin, shopIcon } from '../ui/IconLibrary';

const TABS: { key: ShopCategory; labelKey: string }[] = [
  { key: 'character', labelKey: 'characters' },
  { key: 'backpack', labelKey: 'backpacks' },
  { key: 'skateboard', labelKey: 'skateboards' },
  { key: 'clothes', labelKey: 'clothes' },
  { key: 'weapon', labelKey: 'weapons' },
  { key: 'coins', labelKey: 'coins' },
  { key: 'offer', labelKey: 'offers' },
];

export function ShopScreen() {
  const t = useI18n();
  const { shopItems, player, setPlayer, setScreen, showToast } = useAppStore();
  const [tab, setTab] = useState<ShopCategory>('character');
  const [busy, setBusy] = useState<string | null>(null);

  const catalog = shopItems.length > 0 ? shopItems : FULL_SHOP_CATALOG;
  const items = useMemo(() => catalog.filter((i) => i.category === tab), [catalog, tab]);

  const purchaseSoft = async (item: ShopItem) => {
    if (busy) return;
    setBusy(item.id);
    try {
      if (item.priceCoins != null) {
        try {
          const res = await api.purchase(item.id);
          setPlayer(res.player);
          showToast(`${t.buy}: ${item.name}`);
        } catch {
          // Offline purchase
          if (!player) return;
          if (player.ownedSkins.includes(item.id)) {
            showToast('Ya lo tienes');
            return;
          }
          const price = item.priceCoins ?? 0;
          if (player.coins < price) {
            showToast('Monedas insuficientes');
            return;
          }
          const owned = [...new Set([...player.ownedSkins, item.id])];
          const equipped = { ...player.equippedSkins };
          if (item.category === 'character') equipped.character = item.id;
          if (item.category === 'backpack') equipped.backpack = item.id;
          if (item.category === 'skateboard') equipped.skateboard = item.id;
          if (item.category === 'clothes') equipped.clothes = item.id;
          if (item.category === 'weapon') equipped.weapon = item.id;
          setPlayer({ ...player, coins: player.coins - price, ownedSkins: owned, equippedSkins: equipped });
          showToast(`${t.buy}: ${item.name}`);
        }
      } else if (item.iapProductId) {
        await new Promise((r) => window.setTimeout(r, 500));
        if (player) {
          const next = { ...player };
          if (item.iapProductId.includes('coins_1000')) next.coins += 1000;
          else if (item.iapProductId.includes('coins_5000')) next.coins += 5000;
          else if (item.iapProductId.includes('coins_12000')) next.coins += 12000;
          else if (item.iapProductId.includes('remove_ads')) next.adsRemoved = true;
          else if (item.iapProductId.includes('starter')) {
            next.coins += 2000;
            next.skateboardCharges = Math.min(8, next.skateboardCharges + 5);
          }
          setPlayer(next);
        }
        showToast(item.name);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(null);
    }
  };

  const labelFor = (key: string) => {
    const map: Record<string, string> = {
      characters: t.characters,
      backpacks: t.backpacks,
      skateboards: t.skateboards,
      clothes: t.clothes,
      weapons: t.weapons,
      coins: t.coins,
      offers: t.offers,
    };
    return map[key] ?? key;
  };

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <GameButton compact variant="navy" style={{ width: 'auto' }} onClick={() => setScreen('home')}>
          ←
        </GameButton>
        <h1 className="screen-title">{t.shop}</h1>
        <span style={{ flex: 1 }} />
        {player ? (
          <>
            <CurrencyBadge icon={<IconCoin />} value={player.coins} compact />
            <CurrencyBadge icon={<IconChicken />} value={player.picaPolloTickets} compact />
          </>
        ) : null}
      </div>

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {TABS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            className={`tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
            style={{ minWidth: '28%' }}
          >
            {labelFor(labelKey)}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {items.map((item) => {
          const owned = player?.ownedSkins.includes(item.id);
          const priceLabel =
            item.priceCoins != null
              ? item.priceCoins === 0
                ? 'GRATIS'
                : String(item.priceCoins)
              : item.iapProductId?.includes('remove')
                ? t.removeAds
                : 'IAP';
          return (
            <HudPanel key={item.id} compact className="shop-card">
              <div
                className="shop-preview"
                style={{ background: `linear-gradient(145deg, ${item.previewColor}, #0b1f3a)` }}
              >
                {shopIcon(item.icon, 40)}
                {item.rarity ? <span className={`rarity-pill rarity-${item.rarity}`}>{item.rarity}</span> : null}
              </div>
              <strong className="shop-name">{item.name}</strong>
              {item.description ? <p className="shop-desc">{item.description}</p> : null}
              <GameButton
                compact
                variant={owned ? 'green' : 'blue'}
                disabled={!!busy || (!!owned && item.category !== 'coins' && item.category !== 'offer')}
                onClick={() => void purchaseSoft(item)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {owned && item.category !== 'coins' && item.category !== 'offer' ? (
                    t.equipped
                  ) : (
                    <>
                      {item.priceCoins != null && item.priceCoins > 0 ? <IconCoin size={14} /> : null}
                      {priceLabel}
                    </>
                  )}
                </span>
              </GameButton>
            </HudPanel>
          );
        })}
      </div>
    </div>
  );
}
