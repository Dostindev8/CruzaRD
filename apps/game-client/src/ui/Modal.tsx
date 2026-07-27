import type { ReactNode } from 'react';
import { HudPanel } from './HudPanel';
import { GameButton } from './GameButton';

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="overlay-dim" role="dialog" aria-modal="true">
      <HudPanel className="modal-card">
        <h2 className="modal-title">{title}</h2>
        <div className="stack-gap">{children}</div>
        {onClose ? (
          <div style={{ marginTop: 12 }}>
            <GameButton variant="navy" compact onClick={onClose}>
              OK
            </GameButton>
          </div>
        ) : null}
      </HudPanel>
    </div>
  );
}
