import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';

const HELP_ITEMS = [
  ['helpControls', 'helpControlsBody'],
  ['helpSkate', 'helpSkateBody'],
  ['helpRanking', 'helpRankingBody'],
  ['helpEconomy', 'helpEconomyBody'],
  ['helpBug', 'helpBugBody'],
] as const;

export function HelpScreen() {
  const t = useI18n();
  const setScreen = useAppStore((s) => s.setScreen);

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
          {t.help}
        </h1>
      </div>

      <div className="accordion" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {HELP_ITEMS.map(([titleKey, bodyKey]) => (
          <details key={titleKey}>
            <summary>{t[titleKey]}</summary>
            <p style={{ margin: '8px 0 0', fontSize: '0.85rem', lineHeight: 1.45, opacity: 0.9 }}>
              {t[bodyKey]}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
