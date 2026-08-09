import { useEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sfx';
import { useAppStore } from '../state/appStore';
import { ParallaxBackground } from '../ui/ParallaxBackground';
import { GameButton } from '../ui/GameButton';

const INTRO_KEY = 'cruza.introSeenSession';

interface Props {
  onDone: () => void;
}

type Beat = { text: string; duration: number; impact?: boolean; cta?: boolean };

const BEATS: Beat[] = [
  {
    text: 'La ciudad nunca duerme… hora pico en RD.',
    duration: 3200,
  },
  {
    text: '¡Quítate del medio!',
    duration: 3000,
    impact: true,
  },
  {
    text: 'Toca para jugar',
    duration: 999999,
    cta: true,
  },
];

export function IntroCinematicScreen({ onDone }: Props) {
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const [beat, setBeat] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    onDone();
  };

  useEffect(() => {
    const t = window.setTimeout(() => setCanSkip(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (beat >= BEATS.length - 1) return;
    const b = BEATS[beat]!;
    const dur = reduceMotion ? Math.max(800, b.duration * 0.5) : b.duration;
    if (b.impact) {
      sfx.systemReady();
    }
    const id = window.setTimeout(() => setBeat((x) => x + 1), dur);
    return () => window.clearTimeout(id);
  }, [beat, reduceMotion]);

  const current = BEATS[beat]!;

  return (
    <div
      className="screen intro-cinematic"
      onPointerDown={() => {
        sfx.unlock();
        if (current.cta) finish();
        else if (canSkip) finish();
      }}
      role="presentation"
    >
      <ParallaxBackground variant="intro" />
      <div className="intro-scrim" />

      <button
        type="button"
        className="intro-skip"
        style={{ minWidth: 44, minHeight: 44 }}
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
      >
        Saltar intro ›
      </button>

      <div className={`intro-stage intro-beat-${beat}${current.impact && !reduceMotion ? ' intro-impact' : ''}`}>
        {beat === 1 ? (
          <div className="intro-runner" aria-hidden>
            <span className="intro-chibi">🏃</span>
            <span className="intro-pack">RD</span>
          </div>
        ) : null}
        <p className={`intro-line${current.cta ? ' intro-cta-pulse' : ''}`}>{current.text}</p>
      </div>
    </div>
  );
}

export function hasSeenIntroThisSession(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}
