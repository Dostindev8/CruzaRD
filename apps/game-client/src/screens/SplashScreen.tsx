import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { LogoWordmark } from '../ui/IconLibrary';

interface Props {
  progress: number;
  onDone: () => void;
}

/** Splash Imagen 3 — logo + tagline + mesa cultural + CTA implícito al cargar */
export function SplashScreen({ progress, onDone }: Props) {
  const t = useI18n();
  const [tipIndex, setTipIndex] = useState(0);
  const doneRef = useRef(false);
  const tips = t.loadingTips;

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % Math.max(1, tips.length));
    }, 2500);
    return () => window.clearInterval(id);
  }, [tips.length]);

  useEffect(() => {
    if (progress >= 100 && !doneRef.current) {
      doneRef.current = true;
      const tmr = window.setTimeout(onDone, 280);
      return () => window.clearTimeout(tmr);
    }
  }, [progress, onDone]);

  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div className="screen splash-screen">
      <div className="splash-hero">
        <div className="splash-logo-wrap">
          <LogoWordmark />
        </div>
        <div className="tagline-ribbon">{t.tagline}</div>
      </div>

      <div className="splash-table" aria-hidden>
        <span className="splash-prop" title="Pesos">💵</span>
        <span className="splash-prop" title="Pica Pollo">🍗</span>
        <span className="splash-prop" title="Bocaditos">🥘</span>
        <span className="splash-prop" title="Mangú">🍽️</span>
        <span className="splash-prop" title="Café">☕</span>
        <span className="splash-prop" title="Trofeo">🏆</span>
      </div>

      <div className="loading-bar-wrap splash-loader">
        <div className="loading-bar-track">
          <div className="loading-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="tip-text" key={tipIndex}>
          {tips[tipIndex] ?? ''}
        </p>
      </div>

      <span className="version-chip">v1.0.0 · Cruza RD</span>
    </div>
  );
}
