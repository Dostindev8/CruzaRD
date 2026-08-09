import { useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { GameButton } from '../ui/GameButton';
import { HealthBar } from '../ui/HealthBar';
import { HudPanel } from '../ui/HudPanel';
import { MarqueeBanner } from '../ui/MarqueeBanner';
import { MissionCard } from '../ui/MissionCard';
import { RivalTag } from '../ui/RivalTag';
import { SkateboardWidget } from '../ui/SkateboardWidget';
import {
  IconBanana,
  IconChicken,
  IconCoin,
  IconPause,
  IconShirt,
  IconWeapon,
  IconZap,
} from '../ui/IconLibrary';

export interface RunnerHUDProps {
  score: number;
  multiplier: number;
  /** Coins collected in THIS run only — the persistent wallet lives in the Home screen. */
  sessionCoins: number;
  picaPollo: number;
  skateCharges: number;
  distance: number;
  clothes: number;
  weapons: number;
  health: number;
  maxHealth: number;
  lastHitAt: number;
  canEliminate: boolean;
  nearestLabel: string | null;
  onPause: () => void;
  onEliminate: () => void;
}

export function RunnerHUD({
  score,
  multiplier,
  sessionCoins,
  picaPollo,
  skateCharges,
  distance,
  clothes,
  weapons,
  health,
  maxHealth,
  lastHitAt,
  canEliminate,
  nearestLabel,
  onPause,
  onEliminate,
}: RunnerHUDProps) {
  const t = useI18n();
  const missions = useAppStore((s) => s.missions);
  const leaderboard = useAppStore((s) => s.leaderboard);

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
      progress: jumpMission?.progress ?? 0,
      target: jumpMission?.template.target ?? 20,
    },
  ];

  const rival = leaderboard
    .filter((row) => !row.isSelf && row.bestScore > score)
    .sort((a, b) => a.bestScore - b.bestScore)[0];

  return (
    <div className="screen runner-hud" style={{ pointerEvents: 'none', padding: 0 }}>
      <div className="hud-top" style={{ padding: '10px 12px', pointerEvents: 'auto' }}>
        <div className="hud-top-left">
          <button type="button" className="hub-pause" aria-label={t.pause} onClick={onPause}>
            <IconPause />
          </button>
          <HealthBar health={health} maxHealth={maxHealth} lastHitAt={lastHitAt} />
        </div>

        <div className="hud-center-score">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconBanana size={20} />
            <span className="hud-mult">x{multiplier}</span>
          </div>
          <div className="score-big">{score.toLocaleString('es-DO')}</div>
          {rival ? (
            <RivalTag name={rival.displayName} targetScore={rival.bestScore} currentScore={score} />
          ) : null}
        </div>

        <div className="hud-session-coins">
          <CurrencyBadge icon={<IconChicken />} value={picaPollo} compact />
          <CurrencyBadge icon={<IconCoin />} value={sessionCoins} compact />
        </div>
      </div>

      <div className="hud-marquee" style={{ pointerEvents: 'none' }}>
        <MarqueeBanner text={t.tagline} lines={1} compact />
      </div>

      <div className="hud-missions" style={{ pointerEvents: 'none' }}>
        {hudMissions.map((m) => (
          <HudPanel key={m.id} compact>
            <MissionCard
              id={m.id}
              layout="card"
              title={m.title}
              progress={m.progress}
              target={m.target}
            />
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
              {t.eliminate} {nearestLabel ?? ''}
            </span>
          </GameButton>
          <p className="eliminate-hint">Usa 1 arma de la calle · arcade satírico</p>
        </div>
      ) : null}

      <div className="skate-meter" style={{ pointerEvents: 'none' }}>
        <HudPanel compact>
          <SkateboardWidget charges={skateCharges} orientation="vertical" />
        </HudPanel>
      </div>

      <div className="distance-chip">{Math.floor(distance)} m</div>
    </div>
  );
}
