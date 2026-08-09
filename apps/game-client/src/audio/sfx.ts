import { useAppStore } from '../state/appStore';

/** Lightweight SFX via Web Audio — respects soundOn; unlocks after first user gesture. */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!useAppStore.getState().soundOn) return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beep(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  o.start(now);
  o.stop(now + dur);
}

export const sfx = {
  unlock() {
    getCtx();
  },
  techHumStart() {
    /* ambient omitted without loop asset — tick only */
  },
  checkpoint() {
    beep(880, 0.06, 'square', 0.05);
  },
  systemReady() {
    beep(523, 0.08, 'sine', 0.07);
    window.setTimeout(() => beep(784, 0.12, 'sine', 0.07), 80);
  },
  spinTick(rate = 1) {
    beep(420 * rate, 0.035, 'triangle', 0.04 * Math.min(1, rate));
  },
  prizeCommon() {
    beep(600, 0.1, 'sine', 0.06);
  },
  prizeEpic() {
    beep(392, 0.1, 'sine', 0.08);
    window.setTimeout(() => beep(523, 0.12, 'sine', 0.08), 90);
    window.setTimeout(() => beep(784, 0.18, 'sine', 0.09), 180);
  },
};
