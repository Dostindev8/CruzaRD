import { useEffect, useState } from 'react';

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Counts down to an absolute epoch timestamp, so the value stays correct after a
 * reload, a tab suspend or an app resume. Calls `onExpire` once when it reaches zero.
 */
export function useCountdown(targetAt: number, onExpire?: () => void): string {
  const [label, setLabel] = useState(() => format(targetAt - Date.now()));

  useEffect(() => {
    let fired = false;
    const update = () => {
      const remaining = targetAt - Date.now();
      setLabel(format(remaining));
      if (remaining <= 0 && !fired) {
        fired = true;
        onExpire?.();
      }
    };
    update();
    const id = window.setInterval(update, 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [targetAt, onExpire]);

  return label;
}
