import { useMemo, useState } from 'react';
import type { ShopItem } from '@cruza-rd/shared-types';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { IconCoin, IconChicken } from '../ui/IconLibrary';

type Tab = 'character' | 'backpack' | 'skateboard' | 'coins' | 'offer';

export function ShopScreen() {
  const t = useI18n();
  const { shopItems, player, setPlayer, setScreen, showToast } = useAppStore();
  const [tab, setTab] = useState<Tab>('character');
  const [busy, setBusy] = useState<string | null>(null);

  const items = useMemo(
    () => shopItems.filter((i) => i.category === tab),
    [shopItems, tab],
  );

  const purchaseSoft = async (item: ShopItem) => {
    if (busy) return;
    setBusy(item.id);
    try {
      if (item.priceCoins != null) {
        const res = await api.purchase(item.id);
        setPlayer(res.player);
        showToast(t.buy);
      } else if (item.iapProductId) {
        await new Promise((r) => window.setTimeout(r, 600));
        if (player) {
          const next = { ...player };
          if (item.iapProductId === 'coins_100') next.coins += 100;
          else if (item.iapProductId === 'coins_500') next.coins += 500;
          else if (item.iapProductId === 'remove_ads') next.adsRemoved = true;
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

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <GameButton compact variant="navy" style={{ width: 'auto' }} onClick={() => setScreen('home')}>
          ←
        </GameButton>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.25rem',
            WebkitTextStroke: '1px #000',
          }}
        >
          {t.shop}
        </h1>
        <span style={{ flex: 1 }} />
        {player ? (
          <>
            <CurrencyBadge icon={<IconCoin />} value={player.coins} compact />
            <CurrencyBadge icon={<IconChicken />} value={player.picaPolloTickets} compact />
          </>
        ) : null}
      </div>

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {(
          [
            ['character', t.characters],
            ['backpack', t.backpacks],
            ['skateboard', t.skateboards],
            ['coins', t.coins],
            ['offer', t.offers],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
            style={{ minWidth: '30%' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {items.length === 0 ? (
          <HudPanel style={{ gridColumn: '1 / -1' }}>
            <p style={{ margin: 0, textAlign: 'center', opacity: 0.7 }}>—</p>
          </HudPanel>
        ) : (
          items.map((item) => {
            const owned = player?.ownedSkins.includes(item.id);
            const priceLabel =
              item.priceCoins != null
                ? `${item.priceCoins} 🪙`
                : item.iapProductId === 'remove_ads'
                  ? t.removeAds
                  : item.iapProductId ?? t.buy;
            return (
              <HudPanel key={item.id} compact style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    height: 64,
                    borderRadius: 12,
                    background: item.previewColor,
                    border: '2px solid rgba(0,0,0,0.25)',
                  }}
                />
                <strong
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </strong>
                <GameButton
                  compact
                  variant={owned ? 'green' : 'blue'}
                  disabled={!!busy || !!owned}
                  onClick={() => void purchaseSoft(item)}
                >
                  {owned ? t.equipped : priceLabel}
                </GameButton>
              </HudPanel>
            );
          })
        )}
      </div>
    </div>
  );
}
