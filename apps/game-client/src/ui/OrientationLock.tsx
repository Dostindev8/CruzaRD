import { useEffect, useState } from 'react';

/** Prompt Maestro §5 — portrait obligatorio en móvil; overlay en landscape. */
export function OrientationLock() {
  const [landscape, setLandscape] = useState(false);

  useEffect(() => {
    const check = () => {
      const narrow = window.matchMedia('(max-width: 900px)').matches;
      const land = window.matchMedia('(orientation: landscape)').matches;
      setLandscape(narrow && land && window.innerHeight < 500);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (!landscape) return null;

  return (
    <div className="orientation-lock" role="alertdialog" aria-live="assertive">
      <div className="orientation-card">
        <div className="orientation-icon" aria-hidden>
          📱
        </div>
        <p>Gira el teléfono a vertical</p>
        <span>Cruza RD se juega en portrait</span>
      </div>
    </div>
  );
}
