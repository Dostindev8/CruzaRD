/** Real SVG icon set — no emoji placeholders */

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

export function IconGift({ size = 20, color = '#E6303F' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M20 7h-2.2A3 3 0 0 0 13 4a3 3 0 0 0-2.8 3H8a2 2 0 0 0-2 2v2h16V9a2 2 0 0 0-2-2zM11 7a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm2 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zM6 13v7a2 2 0 0 0 2 2h3v-9H6zm7 9h3a2 2 0 0 0 2-2v-7h-5z"
      />
    </svg>
  );
}

export function IconSpin({ size = 20, color = '#F5C542' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
      <path fill={color} d="M12 3v9l6 3.5A9 9 0 0 0 12 3z" opacity="0.85" />
    </svg>
  );
}

export function IconBanana({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FFD23F"
        stroke="#B8892A"
        strokeWidth="1"
        d="M5 16c2 4 8 6 12 2 1-1 2-3 1-4-3 2-7 2-10 0-1 1-2 2-3 2z"
      />
      <path fill="#8B5A2B" d="M17 7c1 1 1.5 2.5 1 3.5" />
    </svg>
  );
}

export function IconCoin({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="#FFCC4D" stroke="#B8892A" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill="#8A5A00">
        $
      </text>
    </svg>
  );
}

export function IconChicken({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="14" rx="7" ry="5" fill="#C1272D" />
      <path fill="#F7ECD9" d="M8 11c2-4 8-4 10 0l-1 2H9z" />
      <circle cx="10" cy="10" r="1.2" fill="#F5C542" />
    </svg>
  );
}

export function IconCrown({ size = 16, color = '#F5C542' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill={color} d="M3 17h18l-2-10-4 4-3-6-3 6-4-4z" />
    </svg>
  );
}

export function IconSkate({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="11" width="18" height="3" rx="1.5" fill="#222" />
      <rect x="4" y="10" width="16" height="2" rx="1" fill="#FF7A18" />
      <circle cx="7" cy="16" r="2" fill="#444" />
      <circle cx="17" cy="16" r="2" fill="#444" />
    </svg>
  );
}

export function IconShirt({ size = 22, color = '#1D63C7' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M16 4l2 2 3-1-2 5h-2v10H7V10H5L3 5l3 1 2-2h2l2 2h2l2-2z"
      />
    </svg>
  );
}

export function IconWeapon({ size = 22, color = '#8B5A2B' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="10" y="3" width="4" height="14" rx="1" fill={color} />
      <rect x="8" y="16" width="8" height="3" rx="1" fill="#5D4037" />
      <circle cx="12" cy="5" r="1.5" fill="#F5C542" />
    </svg>
  );
}

export function IconMegaphone({ size = 22, color = '#F5C542' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill={color} d="M3 10v4h3l8 4V6L6 10H3z" />
      <path fill="#333" d="M18 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

export function IconFlag({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="3" width="2" height="18" fill="#333" />
      <rect x="6" y="4" width="14" height="5" fill="#0033A0" />
      <rect x="6" y="9" width="14" height="2" fill="#fff" />
      <rect x="6" y="11" width="14" height="5" fill="#D5162C" />
    </svg>
  );
}

export function IconStar({ size = 22, color = '#F5C542' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={color}
        d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 7-6.2-3.4L5.8 21 7 14.2 2 9.3l7.1-1z"
      />
    </svg>
  );
}

export function IconZap({ size = 22, color = '#FFE07A' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill={color} d="M13 2L4 14h7l-1 8 10-14h-7z" />
    </svg>
  );
}

export function shopIcon(icon?: string, size = 36) {
  switch (icon) {
    case 'backpack':
      return <IconCart size={size} color="#fff" />;
    case 'skate':
      return <IconSkate size={size} />;
    case 'hat':
    case 'shirt':
    case 'pants':
    case 'shoe':
      return <IconShirt size={size} />;
    case 'bat':
    case 'bottle':
    case 'umbrella':
      return <IconWeapon size={size} />;
    case 'megaphone':
      return <IconMegaphone size={size} />;
    case 'flag':
      return <IconFlag size={size} />;
    case 'coin':
      return <IconCoin size={size} />;
    case 'star':
      return <IconStar size={size} />;
    case 'gift':
      return <IconGift size={size} />;
    case 'runner':
    default:
      return <IconPlay size={size} color="#fff" />;
  }
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
