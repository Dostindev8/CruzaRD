import type { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';

export interface MissionCardData {
  id: string;
  title: string;
  progress: number;
  target: number;
  icon?: ReactNode;
}

interface Props extends MissionCardData {
  /** 'row' inside the Home missions panel, 'card' as a standalone HUD overlay. */
  layout?: 'row' | 'card';
}

/** Shared between the Home missions panel and the in-run HUD overlays. */
export function MissionCard({ title, progress, target, icon, layout = 'row' }: Props) {
  const safeTarget = Math.max(1, target);
  const clamped = Math.min(safeTarget, Math.max(0, progress));
  const done = clamped >= safeTarget;

  return (
    <div className={`mission-card mission-card--${layout}${done ? ' is-done' : ''}`}>
      <div className="mission-card-head">
        {icon ? <span className="mission-card-icon">{icon}</span> : null}
        <span className="mission-card-title">{title}</span>
        <span className="mission-card-count">
          {clamped}/{safeTarget}
        </span>
      </div>
      <ProgressBar value={clamped} max={safeTarget} height={layout === 'card' ? 9 : 8} />
    </div>
  );
}
