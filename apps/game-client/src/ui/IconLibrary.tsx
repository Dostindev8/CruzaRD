/** Lightweight SVG icon set — LCS owned, no third-party license risk */

type IconProps = { size?: number; color?: string };

export function IconPlay({ size = 22, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill={color} d="M8 5v14l11-7z" />
    </svg>
  );
}

export function IconCart({ size = 22, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.2 14h11.4l1.8-8H6.1L5.4 3H2v2h2.2l2.9 12H19v-2H8.4l-.2-1z"
      />
    </svg>
  );
}

export function IconGear({ size = 22, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M19.1 12.9a7.5 7.5 0 0 0 .1-.9 7.5 7.5 0 0 0-.1-.9l2-1.6-1.9-3.3-2.4 1a7.4 7.4 0 0 0-1.6-.9l-.4-2.6h-3.8l-.4 2.6a7.4 7.4 0 0 0-1.6.9l-2.4-1-1.9 3.3 2 1.6a7.5 7.5 0 0 0-.1.9 7.5 7.5 0 0 0 .1.9l-2 1.6 1.9 3.3 2.4-1c.5.4 1 .7 1.6.9l.4 2.6h3.8l.4-2.6c.6-.2 1.1-.5 1.6-.9l2.4 1 1.9-3.3-2-1.6zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
      />
    </svg>
  );
}

export function IconHelp({ size = 22, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fill={color} fontSize="12" fontWeight="800">
        ?
      </text>
    </svg>
  );
}

export function IconTrophy({ size = 22, color = '#F5C542' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M7 4h10v2h3v3a5 5 0 0 1-4.5 4.95A5.5 5.5 0 0 1 13 17.9V19h3v2H8v-2h3v-1.1A5.5 5.5 0 0 1 8.5 13.95 5 5 0 0 1 4 9V6h3V4zm0 4H6v1a3 3 0 0 0 3 3V8H7zm11 0h-3v3a3 3 0 0 0 3-3V8z"
      />
    </svg>
  );
}

export function IconPause({ size = 22, color = '#fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" fill={color} />
      <rect x="14" y="5" width="4" height="14" rx="1" fill={color} />
    </svg>
  );
}

export function IconGift({ size = 20 }: IconProps) {
  return <span style={{ fontSize: size }}>🎁</span>;
}

export function IconSpin({ size = 20 }: IconProps) {
  return <span style={{ fontSize: size }}>🎡</span>;
}

export function IconBanana({ size = 18 }: IconProps) {
  return <span style={{ fontSize: size }}>🍌</span>;
}

export function IconCoin({ size = 18 }: IconProps) {
  return <span style={{ fontSize: size }}>🪙</span>;
}

export function IconChicken({ size = 18 }: IconProps) {
  return <span style={{ fontSize: size }}>🍗</span>;
}

export function IconCrown({ size = 16 }: IconProps) {
  return <span style={{ fontSize: size }}>👑</span>;
}

export function IconSkate({ size = 22 }: IconProps) {
  return <span style={{ fontSize: size }}>🛹</span>;
}

export function LogoWordmark({ compact = false }: { compact?: boolean }) {
  const cls = compact ? 'logo-compact' : 'logo-wordmark';
  return (
    <div className={cls} aria-label="Cruza RD">
      <span className="cruza">CRUZA</span>
      <span className="rd">
        <span className="r">R</span>
        <span className="d">D</span>
      </span>
    </div>
  );
}
