import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sfx';
import { useAppStore } from '../state/appStore';
import { ParallaxBackground } from '../ui/ParallaxBackground';

const ASSET_URLS = [
  '/branding/cruzard-logo.png',
  '/brand/hero.png',
  '/icon-192.png',
  '/icon-512.png',
  '/reference/splash.png',
  '/reference/home-hub.png',
  '/reference/gameplay.png',
];

interface Props {
  onDone: () => void;
}

/** Tech HUD logo reveal + real asset preload progress */
export function TechPreloadScreen({ onDone }: Props) {
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const [progress, setProgress] = useState(0);
  const [assetLabel, setAssetLabel] = useState('INICIALIZANDO...');
  const [error, setError] = useState<string | null>(null);
  const [scanY, setScanY] = useState(0);
  const [readyFlash, setReadyFlash] = useState(false);
  const doneRef = useRef(false);
  const startRef = useRef(performance.now());
  const checkpoints = useRef(new Set<number>());

  const loadAll = useCallback(async () => {
    setError(null);
    setProgress(0);
    checkpoints.current.clear();
    startRef.current = performance.now();
    doneRef.current = false;
    let loaded = 0;
    const total = ASSET_URLS.length;

    const bump = (key: string) => {
      loaded += 1;
      const real = loaded / total;
      setProgress(real);
      setAssetLabel(key.split('/').pop() ?? key);
      const pct = Math.floor(real * 100);
      for (const cp of [25, 50, 75]) {
        if (pct >= cp && !checkpoints.current.has(cp)) {
          checkpoints.current.add(cp);
          sfx.checkpoint();
        }
      }
    };

    try {
      await Promise.all(
        ASSET_URLS.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                bump(src);
                resolve();
              };
              img.onerror = () => {
                bump(src);
                resolve();
              };
              img.src = src;
            }),
        ),
      );
    } catch {
      setError('No se pudieron cargar algunos assets.');
      return;
    }

    const elapsed = performance.now() - startRef.current;
    const minReveal = reduceMotion ? 400 : 1200;
    const wait = Math.max(0, minReveal - elapsed);
    await new Promise((r) => window.setTimeout(r, wait));
    setProgress(1);
    setAssetLabel('SISTEMA LISTO');
    sfx.systemReady();
    setReadyFlash(true);
    window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, reduceMotion ? 200 : 450);
  }, [onDone, reduceMotion]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (reduceMotion) {
      setScanY(progress);
      return;
    }
    setScanY(progress);
  }, [progress, reduceMotion]);

  const pct = Math.round(progress * 100);

  return (
    <div className="screen tech-preload">
      <ParallaxBackground variant="menu" />
      <div className="tech-grid" aria-hidden />
      {readyFlash ? <div className="tech-flash" aria-hidden /> : null}

      <div className="tech-hud-side tech-hud-left">
        <span>INICIALIZANDO…</span>
        <span>CARGANDO ASSETS…</span>
        <span className="tech-mono">{assetLabel}</span>
      </div>
      <div className="tech-hud-side tech-hud-right">
        <span className="tech-mono">{pct.toString().padStart(3, '0')}%</span>
        <span>CRUZA RD · SYS</span>
      </div>

      <div className={`tech-logo-stage${reduceMotion ? ' no-anim' : ''}`}>
        <div className="tech-logo-silhouette" style={{ opacity: 1 - scanY * 0.85 }}>
          <img src="/branding/cruzard-logo.png" alt="" draggable={false} />
        </div>
        <div
          className="tech-logo-color"
          style={{
            clipPath: `inset(0 0 ${(1 - scanY) * 100}% 0)`,
          }}
        >
          <img src="/branding/cruzard-logo.png" alt="Cruza RD" draggable={false} />
        </div>
        <div className="tech-scanline" style={{ top: `${scanY * 100}%` }} />
      </div>

      <div className="tech-progress-wrap">
        <div className="tech-progress-track">
          <div className="tech-progress-fill" style={{ width: `${pct}%` }} />
          {[25, 50, 75].map((c) => (
            <span key={c} className="tech-tick" style={{ left: `${c}%` }} />
          ))}
        </div>
        <p className="tech-status">{error ?? assetLabel}</p>
        {error ? (
          <button type="button" className="tech-retry" onClick={() => void loadAll()}>
            Reintentar
          </button>
        ) : null}
      </div>
    </div>
  );
}
