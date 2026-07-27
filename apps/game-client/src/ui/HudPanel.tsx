import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title?: string;
  style?: CSSProperties;
  className?: string;
  compact?: boolean;
}

export function HudPanel({ children, title, style, className, compact }: Props) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--ui-navy-glass)',
        border: '3px solid var(--ui-gold)',
        borderRadius: compact ? 14 : 'var(--radius-panel)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: compact ? '8px 10px' : '12px 14px',
        boxShadow: 'var(--bevel-navy)',
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.78rem',
            marginBottom: 6,
            color: 'var(--ui-gold-bright)',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}
