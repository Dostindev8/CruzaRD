import { useI18n, type Locale } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';

export function SettingsScreen() {
  const t = useI18n();
  const {
    soundOn,
    musicOn,
    vibrationOn,
    reduceMotion,
    setAudio,
    setScreen,
    player,
    showToast,
  } = useAppStore();

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
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
          {t.settings}
        </h1>
      </div>

      <div className="stack-gap" style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
        <HudPanel title={t.sound}>
          <RowToggle label={t.sound} on={soundOn} onClick={() => setAudio('soundOn', !soundOn)} />
          <RowToggle label={t.music} on={musicOn} onClick={() => setAudio('musicOn', !musicOn)} />
          <RowToggle
            label={t.vibration}
            on={vibrationOn}
            onClick={() => setAudio('vibrationOn', !vibrationOn)}
          />
          <RowToggle
            label={t.reduceMotion}
            on={reduceMotion}
            onClick={() => setAudio('reduceMotion', !reduceMotion)}
          />
        </HudPanel>

        <HudPanel title={t.language}>
          <div style={{ display: 'flex', gap: 8 }}>
            <GameButton
              compact
              variant={t.locale === 'es-DO' ? 'green' : 'navy'}
              onClick={() => t.setLocale('es-DO' as Locale)}
            >
              ES-DO
            </GameButton>
            <GameButton
              compact
              variant={t.locale === 'en' ? 'green' : 'navy'}
              onClick={() => t.setLocale('en' as Locale)}
            >
              EN
            </GameButton>
          </div>
        </HudPanel>

        <HudPanel title={t.account}>
          <p style={{ margin: '0 0 8px', fontSize: '0.85rem' }}>
            {player?.displayName ?? '—'} · {player?.id ?? ''}
          </p>
          <GameButton
            compact
            variant="blue"
            onClick={() => showToast('Google / Apple — próximamente')}
          >
            Link account
          </GameButton>
        </HudPanel>

        <HudPanel title={t.legal}>
          <a className="legal-link" href="#privacy">
            {t.privacy}
          </a>
          <a className="legal-link" href="#terms">
            {t.terms}
          </a>
          <a className="legal-link" href="#credits">
            {t.credits}
          </a>
          <a className="legal-link" href="#support">
            {t.support}
          </a>
        </HudPanel>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            opacity: 0.55,
            margin: '8px 0 0',
          }}
        >
          v1.0.0 (build 2026.07.26)
        </p>
      </div>

      <style>{`
        .legal-link {
          display: block;
          color: var(--ui-gold-bright);
          font-weight: 700;
          font-size: 0.85rem;
          padding: 8px 0;
          text-decoration: none;
          border-bottom: 1px solid rgba(245,197,66,0.2);
        }
      `}</style>
    </div>
  );
}

function RowToggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '0.9rem',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: on ? 'var(--btn-green)' : '#334',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.25)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 18 : 2,
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
