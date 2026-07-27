/** Game feel helpers — Prompt Maestro v2 §4.3 */

export function triggerHitStop(ms = 70): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function triggerScreenShake(el: HTMLElement | null, reduceMotion: boolean) {
  if (!el || reduceMotion) return;
  el.classList.remove('shake');
  // reflow to restart animation
  void el.offsetWidth;
  el.classList.add('shake');
  window.setTimeout(() => el.classList.remove('shake'), 180);
}

export function triggerHaptic(vibrationOn: boolean, pattern: number | number[] = 18) {
  if (!vibrationOn || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
