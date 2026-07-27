import { useState } from 'react';
import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';

const STEPS = ['onboarding1', 'onboarding2', 'onboarding3'] as const;

export function OnboardingOverlay() {
  const t = useI18n();
  const { player, setPlayer, setScreen, setOverlay } = useAppStore();
  const [step, setStep] = useState(0);

  const finish = () => {
    try {
      localStorage.setItem('cruza.onboarding', '1');
      const p = useAppStore.getState().player;
      if (p) {
        setPlayer({ ...p, onboardingSeen: true, isFirstLaunch: false });
      }
      setOverlay(null);
      setScreen('home');
    } catch (e) {
      console.error(e);
      setScreen('home');
    }
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const label = t[STEPS[step]];

  return (
    <div className="overlay-dim" role="dialog" aria-modal="true">
      <HudPanel className="modal-card" style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.75rem',
            color: 'var(--ui-gold-bright)',
            marginBottom: 8,
            letterSpacing: '0.08em',
          }}
        >
          {step + 1} / {STEPS.length}
        </div>
        <h2 className="modal-title" style={{ fontSize: '1.35rem', marginBottom: 18 }}>
          {label}
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 18,
          }}
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i === step ? 'var(--ui-gold)' : 'rgba(255,255,255,0.25)',
                border: '1px solid var(--ui-gold)',
              }}
            />
          ))}
        </div>
        <GameButton variant="red" hero onClick={next}>
          {step >= STEPS.length - 1 ? t.onboardingCta : t.continue}
        </GameButton>
      </HudPanel>
    </div>
  );
}
