import { MAX_SKATE_CHARGES } from '../game/DifficultyCurve';
import { IconSkate } from './IconLibrary';

interface Props {
  charges: number;
  orientation?: 'horizontal' | 'vertical';
  /** Home shows the "NIVEL n" label; the in-run widget only shows the pips. */
  showLevel?: boolean;
  onUpgrade?: () => void;
  levelLabel?: string;
}

/** Segmented "lives"-style meter shared by the Home panel and the gameplay HUD. */
export function SkateboardWidget({
  charges,
  orientation = 'horizontal',
  showLevel,
  onUpgrade,
  levelLabel = 'NIVEL',
}: Props) {
  const max = MAX_SKATE_CHARGES;
  const filled = Math.max(0, Math.min(max, charges));

  return (
    <div className={`skate-widget skate-widget--${orientation}`}>
      <div className="skate-widget-art">
        <IconSkate size={orientation === 'vertical' ? 26 : 32} />
      </div>

      <div className="skate-widget-body">
        {showLevel ? (
          <div className="skate-widget-level">
            {levelLabel} {filled}
          </div>
        ) : null}
        <div className={`skate-segments${orientation === 'vertical' ? ' skate-segments--vertical' : ''}`}>
          {Array.from({ length: max }).map((_, i) => (
            <div key={i} className={`skate-seg${i < filled ? ' on' : ''}`} />
          ))}
        </div>
      </div>

      {onUpgrade ? (
        <button type="button" className="plus-chip" aria-label="Mejorar patineta" onClick={onUpgrade}>
          +
        </button>
      ) : null}
    </div>
  );
}
