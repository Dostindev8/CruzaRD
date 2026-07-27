import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { ProgressBar } from '../ui/ProgressBar';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { Toast } from '../ui/Toast';
import {
  IconPlay,
  IconCart,
  IconGear,
  IconHelp,
  IconTrophy,
  IconBanana,
  IconCoin,
  IconChicken,
  LogoWordmark,
} from '../ui/IconLibrary';
import { useAppStore } from '../state/appStore';

/** Design-system gallery — open with #debug */
export function DebugUiPage() {
  const setScreen = useAppStore((s) => s.setScreen);
  return (
    <div className="debug-page">
      <h1>Cruza RD — UI Kit</h1>
      <p style={{ opacity: 0.7 }}>DoD Fase 1 · /debug/ui via #debug</p>
      <LogoWordmark />
      <div className="tagline-ribbon" style={{ margin: '12px 0' }}>
        ¡QUÍTATE DEL MEDIO!
      </div>
      <div className="stack-gap" style={{ maxWidth: 360 }}>
        <GameButton variant="red" icon={<IconPlay />} hero>
          JUGAR
        </GameButton>
        <GameButton variant="blue" icon={<IconCart />}>
          TIENDA
        </GameButton>
        <GameButton variant="green" icon={<IconGear />}>
          AJUSTES
        </GameButton>
        <div className="corner-row">
          <GameButton variant="navy" compact icon={<IconHelp />}>
            AYUDA
          </GameButton>
          <GameButton variant="navy" compact icon={<IconTrophy />}>
            RANKING
          </GameButton>
        </div>
        <HudPanel title="MISIONES">
          <div className="mission-row">
            <span>Recoge 500 monedas — 320/500</span>
            <ProgressBar value={320} max={500} />
          </div>
        </HudPanel>
        <div style={{ display: 'flex', gap: 8 }}>
          <CurrencyBadge icon={<IconBanana />} value="x4" />
          <CurrencyBadge icon={<IconCoin />} value={831} onPlus={() => undefined} />
          <CurrencyBadge icon={<IconChicken />} value={78} />
        </div>
      </div>
      <Toast message="¡MISIÓN COMPLETADA! +50" />
      <div style={{ marginTop: 24 }}>
        <GameButton variant="navy" onClick={() => setScreen('home')}>
          Volver
        </GameButton>
      </div>
    </div>
  );
}
