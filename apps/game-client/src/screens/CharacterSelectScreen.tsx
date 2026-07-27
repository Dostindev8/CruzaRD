import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';

export function CharacterSelectScreen() {
  const t = useI18n();
  const { player, shopItems, setPlayer, setScreen, showToast } = useAppStore();

  const skins = useMemo(() => {
    const fromShop = shopItems.filter((i) => i.category === 'character');
    const ownedIds = new Set(player?.ownedSkins ?? ['default']);
    const list = fromShop.length
      ? fromShop
      : [
          { id: 'default', name: 'Default', previewColor: '#1D63C7', category: 'character' as const },
          { id: 'skin_azul', name: 'Corredor Azul', previewColor: '#1D63C7', category: 'character' as const },
          { id: 'skin_rojo', name: 'Corredor Rojo', previewColor: '#E6303F', category: 'character' as const },
        ];
    return list.filter((s) => ownedIds.has(s.id) || s.id === 'default');
  }, [shopItems, player]);

  const equipped = player?.equippedSkins.character ?? 'default';
  const startIdx = Math.max(
    0,
    skins.findIndex((s) => s.id === equipped),
  );
  const [index, setIndex] = useState(startIdx < 0 ? 0 : startIdx);
  const current = skins[index] ?? skins[0];

  const prev = () => setIndex((i) => (i - 1 + skins.length) % Math.max(1, skins.length));
  const next = () => setIndex((i) => (i + 1) % Math.max(1, skins.length));

  const equip = () => {
    if (!player || !current) return;
    const owned = player.ownedSkins.includes(current.id) || current.id === 'default';
    if (!owned) {
      setScreen('shop');
      return;
    }
    setPlayer({
      ...player,
      equippedSkins: { ...player.equippedSkins, character: current.id },
    });
    showToast(t.equipped);
  };

  return (
    <div className="screen" style={{ alignItems: 'center' }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 10 }}>
        <GameButton compact variant="navy" style={{ width: 'auto' }} onClick={() => setScreen('home')}>
          ←
        </GameButton>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.2rem',
            WebkitTextStroke: '1px #000',
          }}
        >
          {t.characters}
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          width: '100%',
        }}
      >
        <GameButton compact variant="navy" style={{ width: 48 }} onClick={prev}>
          ‹
        </GameButton>

        <HudPanel style={{ width: 'min(70%, 240px)', textAlign: 'center' }}>
          <div
            style={{
              height: 140,
              borderRadius: 16,
              marginBottom: 12,
              background: current?.previewColor ?? '#1D63C7',
              border: '3px solid var(--ui-gold)',
              boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.25)',
            }}
          />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
            {current?.name ?? '—'}
          </strong>
          {current?.id === equipped ? (
            <p style={{ margin: '6px 0 0', color: 'var(--highlight-green)', fontWeight: 800 }}>
              {t.equipped}
            </p>
          ) : null}
        </HudPanel>

        <GameButton compact variant="navy" style={{ width: 48 }} onClick={next}>
          ›
        </GameButton>
      </div>

      <div style={{ width: 'min(100%, 320px)', marginTop: 'auto' }}>
        <GameButton
          variant="green"
          hero
          disabled={!current || current.id === equipped}
          onClick={equip}
        >
          {current?.id === equipped ? t.equipped : t.equip}
        </GameButton>
      </div>
    </div>
  );
}
