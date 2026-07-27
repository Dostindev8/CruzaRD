import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { HudPanel } from '../ui/HudPanel';
import { ProgressBar } from '../ui/ProgressBar';
import {
  IconBanana,
  IconChicken,
  IconCoin,
  IconPause,
  IconSkate,
} from '../ui/IconLibrary';

export interface RunnerHUDProps {
  score: number;
  multiplier: number;
  bananas?: number;
  coins: number;
  picaPollo: number;
  skateCharges: number;
  distance: number;
  onPause: () => void;
}

/** Imagen 1 — HUD in-run: Pica Pollo + Salta obstáculos */
export function RunnerHUD({
  score,
  multiplier,
  coins,
  picaPollo,
  skateCharges,
  distance,
  onPause,
}: RunnerHUDProps) {
  const t = useI18n();
  const missions = useAppStore((s) => s.missions);

  const picaMission = missions.find((m) => m.template.type === 'collect_pica_pollo');
  const jumpMission = missions.find((m) => m.template.type === 'jump_count');

  const hudMissions = [
    picaMission
      ? {
          id: picaMission.missionTemplateId,
          title: 'RECOGE PICA POLLO',
          progress: Math.max(picaMission.progress, picaPollo),
          target: picaMission.template.target,
        }
      : {
          id: 'live_pica',
          title: 'RECOGE PICA POLLO',
          progress: picaPollo,
          target: 100,
        },
    jumpMission
      ? {
          id: jumpMission.missionTemplateId,
          title: 'SALTA OBSTÁCULOS',
          progress: jumpMission.progress,
          target: jumpMission.template.target,
        }
      : {
          id: 'live_jump',
          title: 'SALTA OBSTÁCULOS',
          progress: 12,
          target: 20,
        },
  ];

  const charges = Math.max(0, Math.min(8, skateCharges));

  return (
    <div className="screen runner-hud" style={{ pointerEvents: 'none', padding: 0 }}>
      <div className="hud-top" style={{ padding: '10px 12px', pointerEvents: 'auto' }}>
        <button
          type="button"
          className="hub-pause"
          aria-label={t.pause}
          onClick={onPause}
        >
          <IconPause />
        </button>

        <div className="hud-center-score">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconBanana size={20} />
            <span className="hud-mult">x{multiplier}</span>
          </div>
          <div className="score-big">{score.toLocaleString('es-DO')}</div>
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
