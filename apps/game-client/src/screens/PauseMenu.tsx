import { useState } from 'react';
import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';

export function PauseMenu() {
  const t = useI18n();
  const {
    soundOn,
    musicOn,
    setAudio,
    setScreen,
    setOverlay,
  } = useAppStore();
  const [confirmMenu, setConfirmMenu] = useState(false);

  const continueRun = () => {
    setOverlay(null);
    setScreen('runner');
  };

  const restart = () => {
    useAppStore.getState().bumpRunNonce();
    setOverlay(null);
    setScreen('runner');
  };

  return (
    <div className="overlay-dim" role="dialog" aria-modal="true">
      <HudPanel className="modal-card">
        <h2 className="modal-title">{t.pause}</h2>
        <div className="stack-gap">
          <GameButton variant="green" onClick={continueRun}>
            {t.continue}
          </GameButton>
          <GameButton variant="blue" onClick={restart}>
            {t.restart}
          </GameButton>
          <GameButton variant="navy" onClick={() => setScreen('settings')}>
            {t.settings}
          </GameButton>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            <Toggle
              label={t.sound}
              on={soundOn}
              onToggle={() => setAudio('soundOn', !soundOn)}
            />
            <Toggle
              label={t.music}
              on={musicOn}
              onToggle={() => setAudio('musicOn', !musicOn)}
            />
          </div>

          {confirmMenu ? (
            <HudPanel compact>
              <p style={{ fontSize: '0.8rem', margin: '0 0 8px', textAlign: 'center' }}>
                {t.confirmLoseRun}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <GameButton compact variant="red" onClick={() => setScreen('home')}>
                  {t.yes}
                </GameButton>
                <GameButton compact variant="navy" onClick={() => setConfirmMenu(false)}>
                  {t.no}
                </GameButton>
              </div>
            </HudPanel>
          ) : (
            <GameButton variant="red" onClick={() => setConfirmMenu(true)}>
              {t.mainMenu}
            </GameButton>
          )}
        </div>
      </HudPanel>
    </div>
  );
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 14,
        background: 'var(--ui-navy-light)',
        border: '2px solid var(--ui-gold)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '0.8rem',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: on ? 'var(--btn-green)' : '#334',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 1,
            left: on ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 120ms ease',
          }}
        />
      </span>
    </button>
  );
}
