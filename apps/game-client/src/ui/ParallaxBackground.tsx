import { useEffect, useRef } from 'react';
import { useAppStore } from '../state/appStore';

type Variant = 'menu' | 'intro' | 'hud';

interface Props {
  variant?: Variant;
  className?: string;
}

/**
 * CSS parallax skyline — reutilizable en menú/intro/HUD overlay.
 * Tile-scroll via requestAnimationFrame; respeta reduce-motion.
 */
export function ParallaxBackground({ variant = 'menu', className }: Props) {
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduceMotion) return;
    let raf = 0;
    let t0 = performance.now();
    const layers = el.querySelectorAll<HTMLElement>('[data-parallax]');
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      layers.forEach((layer) => {
        const speed = Number(layer.dataset.parallax) || 0.2;
        const cur = Number(layer.dataset.x || 0);
        const next = cur + speed * 40 * dt;
        layer.dataset.x = String(next);
        layer.style.backgroundPositionX = `${-next}px`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, variant]);

  return (
    <div
      ref={rootRef}
      className={`parallax-bg parallax-bg--${variant}${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      <div className="parallax-sky" />
      <div className="parallax-layer parallax-skyline" data-parallax="0.15" data-x="0" />
      <div className="parallax-layer parallax-palms" data-parallax="0.35" data-x="0" />
      <div className="parallax-layer parallax-road" data-parallax="0.7" data-x="0" />
      <div className="parallax-layer parallax-traffic" data-parallax="1.0" data-x="0" />
      <div className="parallax-vignette" />
    </div>
  );
}
