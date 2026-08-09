import { getLocale, useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { ParallaxBackground } from '../ui/ParallaxBackground';
import { RewardWheel } from '../ui/RewardWheel/RewardWheel';
import { IconSpin } from '../ui/IconLibrary';

const FLAG_STRIPES = ['#0033a0', '#f5c542', '#d5162c', '#0033a0', '#f5c542', '#d5162c'];

export function DailySpinScreen() {
  const t = useI18n();
  const setScreen = useAppStore((s) => s.setScreen);
  const locale = getLocale();

  return (
    <div className="screen" style={{ alignItems: 'center' }}>
      <ParallaxBackground variant="menu" />

      <div className="spin-header">
        <GameButton
          compact
          variant="navy"
          aria-label={t.mainMenu}
          style={{ width: 'auto', minWidth: 44, minHeight: 44 }}
          onClick={() => setScreen('home')}
        >
          ←
        </GameButton>
        <h1 className="spin-title">
          <IconSpin size={24} />
          {t.dailySpin}
        </h1>
      </div>

      <div className="spin-stage">
        <RewardWheel
          locale={locale === 'en' ? 'en' : 'es-DO'}
          labels={{
            hint: t.spinHint,
            claimed: t.spinClaimed,
            unlocked: t.spinUnlocked,
            noBalance: t.spinNoBalance,
            continue: t.continue,
          }}
        />
      </div>

      <div className="flag-stripes" aria-hidden>
        {FLAG_STRIPES.map((color, i) => (
          <span key={i} style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}
