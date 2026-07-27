import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import {
  IconBanana,
  IconChicken,
  IconCoin,
  IconCrown,
} from '../ui/IconLibrary';

export function GameOverScreen() {
  const t = useI18n();
  const { lastRun, player, setScreen, setOverlay, showToast } = useAppStore();
  const [confirming, setConfirming] = useState(false);

  const title = useMemo(() => {
    const alts = [t.gameOverTitle, t.gameOverAlt1, t.gameOverAlt2, t.gameOverAlt3];
    return alts[Math.floor(Math.random() * alts.length)]!;
  }, [t.gameOverAlt1, t.gameOverAlt2, t.gameOverAlt3, t.gameOverTitle]);

  const score = lastRun?.score ?? player?.lastScore ?? 0;
  const best = player?.bestScore ?? 0;
  const coins = lastRun?.coins ?? 0;
  const isRecord = lastRun?.isRecord ?? score >= best;

  const share = async () => {
    const text = `Cruza RD — ${score.toLocaleString('es-DO')} pts! ${t.tagline}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t.appName, text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast(t.shareScore);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        showToast(t.shareScore);
      } catch {
        showToast(text);
      }
    }
  };

  return (
    <div className="overlay-dim" style={{ zIndex: 35 }}>
      <HudPanel className="modal-card" style={{ width: 'min(100%, 380px)' }}>
        <h2 className="modal-title" style={{ fontSize: '1.4rem', color: 'var(--ui-gold-bright)' }}>
          {title}
        </h2>

        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <IconBanana />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: '#5ad0ff',
                fontSize: '1.1rem',
              }}
            >
              x{lastRun?.multiplier ?? player?.lastMultiplier ?? 1}
            </span>
          </div>
          <div className="score-big" style={{ fontSize: '2rem' }}>
            {score.toLocaleString('es-DO')}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: 'var(--ui-gold)',
            }}
          >
            <IconCrown />
            {isRecord ? t.newRecord : `${t.best}: ${best.toLocaleString('es-DO')}`}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
          <CurrencyBadge icon={<IconCoin />} value={coins} />
          <CurrencyBadge icon={<IconChicken />} value={lastRun?.picaPollo ?? 0} />
        </div>

        <div className="stack-gap">
          <GameButton variant="blue" onClick={() => setOverlay('revive')}>
            {t.reviveAd}
          </GameButton>
          <GameButton
            variant="red"
            onClick={() => {
              useAppStore.getState().bumpRunNonce();
              setScreen('runner');
            }}
          >
            {t.playAgain}
          </GameButton>
          <GameButton variant="navy" onClick={() => void share()}>
            {t.shareScore}
          </GameButton>
          {confirming ? (
            <HudPanel compact>
              <p style={{ fontSize: '0.8rem', margin: '0 0 8px', textAlign: 'center' }}>
                {t.confirmLoseRun}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <GameButton compact variant="red" onClick={() => setScreen('home')}>
                  {t.yes}
                </GameButton>
                <GameButton compact variant="navy" onClick={() => setConfirming(false)}>
                  {t.no}
                </GameButton>
              </div>
            </HudPanel>
          ) : (
            <GameButton variant="green" onClick={() => setConfirming(true)}>
              {t.menu}
            </GameButton>
          )}
        </div>
      </HudPanel>
    </div>
  );
}
