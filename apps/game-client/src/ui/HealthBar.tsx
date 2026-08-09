import { useEffect, useRef, useState } from 'react';

interface Props {
  health: number;
  maxHealth: number;
  /** Epoch ms of the last hit — a new value replays the damage animation. */
  lastHitAt: number;
}

/** Red life bar with a damage tween instead of an instant width jump. */
export function HealthBar({ health, maxHealth, lastHitAt }: Props) {
  const [hit, setHit] = useState(false);
  const prevHitAt = useRef(lastHitAt);

  useEffect(() => {
    if (lastHitAt === prevHitAt.current || lastHitAt === 0) return;
    prevHitAt.current = lastHitAt;
    setHit(true);
    const id = window.setTimeout(() => setHit(false), 280);
    return () => window.clearTimeout(id);
  }, [lastHitAt]);

  const pct = Math.max(0, Math.min(100, (health / Math.max(1, maxHealth)) * 100));

  return (
    <div
      className={`health-bar${hit ? ' is-hit' : ''}`}
      role="progressbar"
      aria-label="Vida"
      aria-valuenow={health}
      aria-valuemin={0}
      aria-valuemax={maxHealth}
    >
      <div className="health-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
