import { useAppStore } from '../state/appStore';

interface Props {
  text: string;
  /** Home uses the two-line stacked banner; the HUD uses the slim single line. */
  lines?: 1 | 2;
  compact?: boolean;
}

/**
 * Yellow ribbon with an infinite horizontal scroll. The track is duplicated so the
 * translation can loop at -50% without a visible seam.
 */
export function MarqueeBanner({ text, lines = 2, compact }: Props) {
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const rows = lines === 2 ? [0, 1] : [0];

  return (
    <div className={`marquee-banner${compact ? ' marquee-banner--sm' : ''}`} aria-label={text}>
      {rows.map((row) => (
        <div className="marquee-row" key={row}>
          <div
            className={`marquee-track${reduceMotion ? ' is-static' : ''}`}
            style={{ animationDuration: `${row === 0 ? 14 : 18}s` }}
            aria-hidden={row > 0}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
