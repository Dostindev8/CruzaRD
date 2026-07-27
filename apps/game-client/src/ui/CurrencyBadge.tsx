import type { ReactNode } from 'react';
import { HudPanel } from './HudPanel';

interface Props {
  icon: ReactNode;
  value: number | string;
  onPlus?: () => void;
  compact?: boolean;
}

export function CurrencyBadge({ icon, value, onPlus, compact }: Props) {
  return (
    <HudPanel
      compact
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compact ? '4px 8px' : '6px 10px',
        borderRadius: 999,
        minHeight: 36,
      }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
      <strong
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: compact ? '0.85rem' : '0.95rem',
          WebkitTextStroke: '0.6px #000',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString('es-DO') : value}
      </strong>
      {onPlus ? (
        <button
          type="button"
          aria-label="Buy"
          onClick={onPlus}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 'var(--btn-blue)',
            border: '2px solid var(--ui-gold)',
            fontWeight: 800,
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          +
        </button>
      ) : null}
    </HudPanel>
  );
}
