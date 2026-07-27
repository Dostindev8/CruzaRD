export type Gesture = 'jump' | 'slide' | 'left' | 'right' | 'doubleTap' | null;

const SWIPE_MIN = 36;

export class InputController {
  private startX = 0;
  private startY = 0;
  private lastTap = 0;
  private pending: Gesture = null;
  private jumpBufferedUntil = 0;
  private el: HTMLElement | null = null;

  attach(el: HTMLElement) {
    this.el = el;
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onUp);
    window.addEventListener('keydown', this.onKey);
  }

  detach() {
    const el = this.el;
    if (el) {
      el.removeEventListener('pointerdown', this.onDown);
      el.removeEventListener('pointerup', this.onUp);
      el.removeEventListener('pointercancel', this.onUp);
    }
    window.removeEventListener('keydown', this.onKey);
    this.el = null;
  }

  consume(): Gesture {
    const g = this.pending;
    this.pending = null;
    return g;
  }

  consumeJumpBuffer(now: number): boolean {
    if (now <= this.jumpBufferedUntil) {
      this.jumpBufferedUntil = 0;
      return true;
    }
    return false;
  }

  private onDown = (e: PointerEvent) => {
    this.startX = e.clientX;
    this.startY = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  private onUp = (e: PointerEvent) => {
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const now = performance.now();

    if (adx < SWIPE_MIN && ady < SWIPE_MIN) {
      if (now - this.lastTap < 280) {
        this.pending = 'doubleTap';
        this.lastTap = 0;
      } else {
        this.lastTap = now;
      }
      return;
    }

    if (ady > adx) {
      if (dy < 0) {
        this.pending = 'jump';
        this.jumpBufferedUntil = now + 120;
      } else {
        this.pending = 'slide';
      }
    } else {
      this.pending = dx < 0 ? 'left' : 'right';
    }
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.pending = 'jump';
        this.jumpBufferedUntil = performance.now() + 120;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.pending = 'slide';
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.pending = 'left';
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.pending = 'right';
        break;
      case 'KeyE':
      case 'ShiftLeft':
        this.pending = 'doubleTap';
        break;
    }
  };
}
