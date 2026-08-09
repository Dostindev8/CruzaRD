import { useCallback } from 'react';
import type { MissionProgress } from '@cruza-rd/shared-types';
import { getLocale, useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { MarqueeBanner } from '../ui/MarqueeBanner';
import { MissionCard } from '../ui/MissionCard';
import { SkateboardWidget } from '../ui/SkateboardWidget';
import { useCountdown } from '../ui/useCountdown';
import {
  IconCart,
  IconChicken,
  IconCoin,
  IconCrown,
  IconGear,
  IconGift,
  IconHelp,
  IconPause,
  IconPlay,
  IconSkate,
  IconSpin,
  IconTrophy,
  LogoWordmark,
} from '../ui/IconLibrary';

function isNewPlayerLayout(player: NonNullable<ReturnType<typeof useAppStore.getState>['player']>) {
  return player.isFirstLaunch || (player.totalRuns === 0 && player.bestScore === 0);
}

function missionIcon(type: MissionProgress['template']['type']) {
  switch (type) {
    case 'collect_coins':
      return <IconCoin size={16} />;
    case 'use_powerup':
      return <IconSkate size={16} />;
    case 'collect_pica_pollo':
      return <IconChicken size={16} />;
    default:
      return <IconPlay size={14} />;
  }
}

export function HomeHubScreen() {
  const { player, setScreen, setOverlay } = useAppStore();

  if (!player) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <LogoWordmark />
      </div>
    );
  }

  const simple = isNewPlayerLayout(player);

  const startPlay = () => {
    if (!player.onboardingSeen) {
      setOverlay('onboarding');
      return;
    }
    setScreen('runner');
  };

  return (
    <div className="screen home-hub">
      {simple ? <SimpleHome onPlay={startPlay} /> : <FullHub onPlay={startPlay} />}
    </div>
  );
}

function SimpleHome({ onPlay }: { onPlay: () => void }) {
  const t = useI18n();

  return (
    <>
      <div className="home-hero">
        <LogoWordmark />
        <MarqueeBanner text={t.tagline} lines={2} />
      </div>
      <BottomNav onPlay={onPlay} />
      <FooterNav />
    </>
  );
}

/** Home / menú principal — layout del mockup 1. */
function FullHub({ onPlay }: { onPlay: () => void }) {
  const t = useI18n();
  const locale = getLocale();
  const player = useAppStore((s) => s.player);
  const missions = useAppStore((s) => s.missions);
  const leaderboard = useAppStore((s) => s.leaderboard);
  const missionsResetAt = useAppStore((s) => s.missionsResetAt);
  const rollMissionsWindow = useAppStore((s) => s.rollMissionsWindow);
  const setScreen = useAppStore((s) => s.setScreen);
  const showToast = useAppStore((s) => s.showToast);

  const onExpire = useCallback(() => rollMissionsWindow(), [rollMissionsWindow]);
  const countdown = useCountdown(missionsResetAt, onExpire);

  if (!player) return null;

  const claimable = missions.find((m) => m.completed && !m.claimed);
  const hubMissions = missions
    .filter((m) =>
      ['daily_collect_500', 'daily_jump_20', 'daily_skateboard_5'].includes(m.missionTemplateId),
    )
    .slice(0, 3);
  const shown = hubMissions.length ? hubMissions : missions.slice(0, 3);
  const top3 = leaderboard.slice(0, 3);

  return (
    <>
      <div className="hub-top">
        <button
          type="button"
          className="hub-pause"
          aria-label={t.pause}
          onClick={() => setScreen('settings')}
        >
          <IconPause />
        </button>

        <button
          type="button"
          className="hub-brand"
          aria-label={t.appName}
          onClick={() => setScreen('characters')}
        >
          <LogoWordmark compact />
        </button>

        <div className="hub-wallet">
          <CurrencyBadge
            icon={<IconCoin />}
            value={player.coins ?? 0}
            onPlus={() => setScreen('shop')}
            compact
          />
          <CurrencyBadge
            icon={<IconChicken />}
            value={player.picaPolloTickets ?? 0}
            onPlus={() => setScreen('shop')}
            compact
          />
        </div>
      </div>

      <MarqueeBanner text={t.tagline} lines={2} />

      <HudPanel className="score-card">
        <span className="score-card-label">{t.currentScore}</span>
        <span className="score-card-value">{(player.lastScore || 0).toLocaleString('es-DO')}</span>
        <span className="score-card-best">
          <IconCrown size={14} />
          {t.best}: {(player.bestScore ?? 0).toLocaleString('es-DO')}
        </span>
      </HudPanel>

      <div className="hub-grid">
        <div className="hub-left">
          <HudPanel className="panel-flex">
            <div className="panel-head">
              <IconSpin size={18} />
              <span>{t.dailyMissions}</span>
            </div>
            <div className="panel-scroll">
              {shown.map((m) => {
                const titleObj = m.template?.title;
                const title =
                  (titleObj && (titleObj[locale] || titleObj['es-DO'] || titleObj.en)) ||
                  m.missionTemplateId;
                return (
                  <MissionCard
                    key={m.missionTemplateId}
                    id={m.missionTemplateId}
                    title={title}
                    progress={m.progress ?? 0}
                    target={m.template?.target ?? 1}
                    icon={missionIcon(m.template.type)}
                  />
                );
              })}
            </div>
            <div className="missions-countdown">
              {t.newMissionsIn}: <strong>{countdown}</strong>
            </div>
          </HudPanel>

          <div className="quick-stack">
            <GameButton
              compact
              variant="gold"
              icon={<IconGift />}
              onClick={() => {
                setScreen('missions');
                if (claimable) showToast(t.missionComplete);
              }}
            >
              {t.claim}
            </GameButton>
            <GameButton
              compact
              variant="blue"
              icon={<IconCart size={18} />}
              onClick={() => setScreen('shop')}
            >
              {t.shop}
            </GameButton>
          </div>
          <div className="quick-stack quick-stack--single">
            <div style={{ position: 'relative' }}>
              <GameButton compact variant="blue" icon={<IconSpin />} onClick={() => setScreen('spin')}>
                {t.dailySpin}
              </GameButton>
              {player.spinAvailable ? <span className="notif-dot" /> : null}
            </div>
          </div>
        </div>

        <div className="hub-right">
          <HudPanel className="panel-flex">
            <div className="panel-head">
              <IconTrophy size={18} />
              <span>{t.leaderboardTitle}</span>
            </div>
            <div className="panel-scroll">
              {top3.map((row) => (
                <div key={row.playerId} className={`lb-row${row.isSelf ? ' self' : ''}`}>
                  <span className="lb-rank">{row.rank}</span>
                  <span className="lb-avatar" />
                  <span className="lb-name">{row.isSelf ? t.you : row.displayName}</span>
                  <span className="lb-score">{(row.bestScore ?? 0).toLocaleString('es-DO')}</span>
                </div>
              ))}
            </div>
          </HudPanel>

          <HudPanel compact>
            <div className="panel-head panel-head--sm">
              <IconSkate size={16} />
              <span>{t.skateboard}</span>
            </div>
            <SkateboardWidget
              charges={player.skateboardCharges}
              showLevel
              levelLabel={t.level}
              onUpgrade={() => setScreen('shop')}
            />
          </HudPanel>
        </div>
      </div>

      <BottomNav onPlay={onPlay} />
      <FooterNav />
    </>
  );
}

function BottomNav({ onPlay }: { onPlay: () => void }) {
  const t = useI18n();
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <div className="bottom-nav">
      <GameButton variant="gold" hero icon={<IconPlay />} onClick={onPlay}>
        {t.play}
      </GameButton>
      <GameButton variant="blue" icon={<IconCart />} onClick={() => setScreen('shop')}>
        {t.shop}
      </GameButton>
      <GameButton variant="purple" icon={<IconGear />} onClick={() => setScreen('settings')}>
        {t.settings}
      </GameButton>
    </div>
  );
}

function FooterNav() {
  const t = useI18n();
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <div className="corner-row">
      <GameButton
        compact
        variant="navy"
        icon={<IconHelp size={18} />}
        style={{ width: 'auto', minWidth: 120 }}
        onClick={() => setScreen('help')}
      >
        {t.help}
      </GameButton>
      <GameButton
        compact
        variant="navy"
        icon={<IconTrophy size={18} />}
        style={{ width: 'auto', minWidth: 120 }}
        onClick={() => setScreen('leaderboard')}
      >
        {t.ranking}
      </GameButton>
    </div>
  );
}
