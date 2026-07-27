import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'red' | 'blue' | 'green' | 'navy';

const bevel: Record<Variant, string> = {
  red: 'var(--bevel-red)',
  blue: 'var(--bevel-blue)',
  green: 'var(--bevel-green)',
  navy: 'var(--bevel-navy)',
};

const fill: Record<Variant, string> = {
  red: 'linear-gradient(165deg, #ff5a66, var(--btn-red) 45%, var(--btn-red-dark))',
  blue: 'linear-gradient(165deg, #4a8ef0, var(--btn-blue) 45%, var(--btn-blue-dark))',
  green: 'linear-gradient(165deg, #55d86a, var(--btn-green) 45%, var(--btn-green-dark))',
  navy: 'linear-gradient(165deg, #1e3f6e, var(--ui-navy) 45%, #061225)',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  hero?: boolean;
  compact?: boolean;
}

export function GameButton({
  variant = 'red',
  icon,
  hero,
  compact,
  children,
  disabled,
  style,
  ...rest
}: Props) {
  const base: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: compact ? 44 : hero ? 58 : 52,
    padding: compact ? '8px 14px' : '12px 18px',
    borderRadius: 'var(--radius-btn)',
    border: `${compact ? 3 : 4}px solid var(--ui-gold)`,
    background: fill[variant],
    boxShadow: disabled ? 'none' : bevel[variant],
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: hero ? '1.25rem' : compact ? '0.85rem' : '1.05rem',
    color: '#fff',
    WebkitTextStroke: '1.5px #111',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    transform: 'translateY(0)',
    transition: 'transform 80ms ease, box-shadow 80ms ease, filter 120ms ease',
    filter: disabled ? 'saturate(0.3)' : undefined,
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={base}
      onPointerDown={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(4px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 0 rgba(0,0,0,.4)`;
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = disabled ? 'none' : bevel[variant];
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = disabled ? 'none' : bevel[variant];
      }}
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
