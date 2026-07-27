import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { HudPanel } from '../ui/HudPanel';
import { ProgressBar } from '../ui/ProgressBar';
import { GameButton } from '../ui/GameButton';
import {
  IconBanana,
  IconChicken,
  IconCoin,
  IconPause,
  IconShirt,
  IconSkate,
  IconWeapon,
  IconZap,
} from '../ui/IconLibrary';

export interface RunnerHUDProps {
  score: number;
  multiplier: number;
  coins: number;
  picaPollo: number;
  skateCharges: number;
  distance: number;
  clothes: number;
  weapons: number;
  canEliminate: boolean;
  nearestLabel: string | null;
  onPause: () => void;
  onEliminate: () => void;
}

export function RunnerHUD({
  score,
  multiplier,
  coins,
  picaPollo,
  skateCharges,
  distance,
  clothes,
  weapons,
  canEliminate,
  nearestLabel,
  onPause,
  onEliminate,
}: RunnerHUDProps) {
  const t = useI18n();
  const missions = useAppStore((s) => s.missions);
  const picaMission = missions.find((m) => m.template.type === 'collect_pica_pollo');
  const jumpMission = missions.find((m) => m.template.type === 'jump_count');

  const hudMissions = [
    {
      id: 'pica',
      title: 'RECOGE PICA POLLO',
      progress: Math.max(picaMission?.progress ?? 0, picaPollo),
      target: picaMission?.template.target ?? 100,
    },
    {
      id: 'jump',
      title: 'SALTA OBSTÁCULOS',
      progress: jumpMission?.progress ?? 12,
      target: jumpMission?.template.target ?? 20,
    },
  ];

  const charges = Math.max(0, Math.min(8, skateCharges));

  return (
    <div className="screen runner-hud" style={{ pointerEvents: 'none', padding: 0 }}>
      <div className="hud-top" style={{ padding: '10px 12px', pointerEvents: 'auto' }}>
        <button type="button" className="hub-pause" aria-label={t.pause} onClick={onPause}>
          <IconPause />
        </button>

        <div className="hud-center-score">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconBanana size={20} />
            <span className="hud-mult">x{multiplier}</span>
          </div>
          <div className="score-big">{score.toLocaleString('es-DO')}</div>
          <div className="tagline-ribbon tagline-ribbon--sm" style={{ pointerEvents: 'none' }}>
            {t.tagline}
          </div>
        </div>

        <div className="hub-wallet">
          <CurrencyBadge icon={<IconChicken />} value={picaPollo} compact />
          <CurrencyBadge icon={<IconCoin />} value={coins} compact />
        </div>
      </div>

      <div className="hud-missions" style={{ pointerEvents: 'none' }}>
        {hudMissions.map((m) => (
          <HudPanel key={m.id} compact>
            <div className="mission-row" style={{ marginBottom: 0 }}>
              <span>
                {m.title} {m.progress}/{m.target}
              </span>
              <ProgressBar value={m.progress} max={m.target} height={8} />
            </div>
          </HudPanel>
        ))}
      </div>

      <div className="run-loot" style={{ pointerEvents: 'none' }}>
        <HudPanel compact>
          <div className="loot-row">
            <IconShirt size={18} />
            <strong>{clothes}</strong>
            <IconWeapon size={18} />
            <strong>{weapons}</strong>
          </div>
        </HudPanel>
      </div>

      {canEliminate ? (
        <div className="eliminate-wrap" style={{ pointerEvents: 'auto' }}>
          <GameButton variant="red" hero onClick={onEliminate}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconZap size={22} />
              ELIMINAR {nearestLabel ?? ''}
            </span>
          </GameButton>
          <p className="eliminate-hint">Usa 1 arma de la calle · arcade satírico</p>
        </div>
      ) : null}

      <div className="skate-meter" style={{ pointerEvents: 'none' }}>
        <HudPanel
          compact
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <IconSkate size={28} />
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginTop: 2,
              }}
            >
              {charges}
            </div>
          </div>
          <div className="skate-segments">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`skate-seg${i < charges ? ' on' : ''}`} />
            ))}
          </div>
        </HudPanel>
      </div>

      <div className="distance-chip">{Math.floor(distance)} m</div>
    </div>
  );
}
