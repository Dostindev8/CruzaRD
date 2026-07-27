import { useState } from 'react';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { IconSpin } from '../ui/IconLibrary';

const OFFLINE_PRIZES = [
  { label: '+50 monedas', coins: 50, pica: 0, skate: 0 },
  { label: '+100 monedas', coins: 100, pica: 0, skate: 0 },
  { label: '+2 Pica Pollo', coins: 0, pica: 2, skate: 0 },
  { label: '+1 Patineta', coins: 0, pica: 0, skate: 1 },
  { label: '+250 monedas', coins: 250, pica: 0, skate: 0 },
  { label: '+5 Pica Pollo', coins: 0, pica: 5, skate: 0 },
  { label: '+75 monedas', coins: 75, pica: 0, skate: 0 },
  { label: '¡Otra vez!', coins: 25, pica: 0, skate: 0 },
];

export function DailySpinScreen() {
  const t = useI18n();
  const { player, setPlayer, setScreen, showToast } = useAppStore();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const applyOfflinePrize = () => {
    if (!player) return OFFLINE_PRIZES[0]!.label;
    const prize = OFFLINE_PRIZES[Math.floor(Math.random() * OFFLINE_PRIZES.length)]!;
    setPlayer({
      ...player,
      coins: player.coins + prize.coins,
      picaPolloTickets: player.picaPolloTickets + prize.pica,
      skateboardCharges: Math.min(8, player.skateboardCharges + prize.skate),
      spinAvailable: false,
    });
    return prize.label;
  };

  const spin = async (extra = false) => {
    if (spinning) return;
    if (!extra && player && !player.spinAvailable) {
      showToast(t.spinExtra);
      return;
    }
    setSpinning(true);
    setResult(null);
    const turns = 4 + Math.floor(Math.random() * 3);
    const offset = Math.floor(Math.random() * 360);
    setRotation((r) => r + turns * 360 + offset);

    try {
      if (extra) {
        await new Promise((r) => window.setTimeout(r, 800));
      }
      let label = '';
      try {
        const res = await api.spin();
        setPlayer(res.player);
        label = res.label;
      } catch {
        label = applyOfflinePrize();
      }
      window.setTimeout(() => {
        setResult(label);
        showToast(label);
        setSpinning(false);
      }, 3200);
    } catch (e) {
      setSpinning(false);
      showToast(e instanceof Error ? e.message : 'Error');
    }
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconSpin size={24} />
          {t.dailySpin}
        </h1>
      </div>

      <div style={{ position: 'relative', margin: '20px auto' }}>
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '18px solid var(--ui-gold)',
            filter: 'drop-shadow(0 2px 0 #000)',
          }}
        />
        <div className="spin-wheel spin-wheel-glow" style={{ transform: `rotate(${rotation}deg)` }} />
      </div>

      {result ? (
        <HudPanel compact style={{ marginBottom: 12, textAlign: 'center', minWidth: 200 }}>
          <strong style={{ fontFamily: 'var(--font-display)' }}>{result}</strong>
        </HudPanel>
      ) : null}

      <div className="stack-gap" style={{ width: 'min(100%, 320px)', marginTop: 'auto' }}>
        <GameButton
          variant="red"
          hero
          disabled={spinning || (player != null && !player.spinAvailable)}
          onClick={() => void spin(false)}
        >
          {t.spinFree}
        </GameButton>
        <GameButton variant="blue" disabled={spinning} onClick={() => void spin(true)}>
          {t.spinExtra}
        </GameButton>
      </div>
    </div>
  );
}
