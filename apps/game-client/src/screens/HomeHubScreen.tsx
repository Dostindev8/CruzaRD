import { getLocale, useI18n } from '../i18n';
import { useAppStore } from '../state/appStore';
import { CurrencyBadge } from '../ui/CurrencyBadge';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { ProgressBar } from '../ui/ProgressBar';
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
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <>
      <div className="home-hero">
        <LogoWordmark />
        <div className="tagline-ribbon">{t.tagline}</div>
      </div>
      <BottomNav onPlay={onPlay} />
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
    </>
  );
}

/** Imagen 2 — hub post-partida pixel layout */
function FullHub({ onPlay }: { onPlay: () => void }) {
  const t = useI18n();
  const locale = getLocale();
  const { player, missions, leaderboard, setScreen, showToast } = useAppStore();
  if (!player) return null;

  const claimable = missions.find((m) => m.completed && !m.claimed);
  const hubMissions = missions
    .filter((m) =>
      ['daily_collect_500', 'daily_jump_20', 'daily_skateboard_5'].includes(m.missionTemplateId),
    )
    .slice(0, 3);
  const shown = hubMissions.length ? hubMissions : missions.slice(0, 3);
  const top5 = leaderboard.slice(0, 5);
  const charges = Math.max(0, Math.min(8, player.skateboardCharges));

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

        <div className="hub-brand">
          <button type="button" onClick={() => setScreen('characters')} style={{ padding: 0 }}>
            <LogoWordmark compact />
          </button>
          <div className="tagline-ribbon tagline-ribbon--sm">{t.tagline}</div>
        </div>

        <div className="hub-score-block">
          <div className="hub-mult">x{player.lastMultiplier || 1}</div>
          <div className="score-big hub-score">{(player.lastScore || 0).toLocaleString('es-DO')}</div>
          <div className="hub-best">
            <IconCrown size={14} />
            {t.best}: {(player.bestScore ?? 0).toLocaleString('es-DO')}
          </div>
        </div>

        <div className="hub-wallet">
          <CurrencyBadge
            icon={<IconCoin />}
            value={player.coins ?? 0}
            onPlus={() => setScreen('shop')}
            compact
          />
          <CurrencyBadge icon={<IconChicken />} value={player.picaPolloTickets ?? 0} compact />
        </div>
      </div>

      <div className="hub-grid">
        <div className="hub-left">
          <HudPanel title={t.missions} style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {shown.map((m) => {
              const titleObj = m.template?.title;
              const title =
                (titleObj && (titleObj[locale] || titleObj['es-DO'] || titleObj.en)) ||
                m.missionTemplateId;
              return (
                <div key={m.missionTemplateId} className="mission-row">
                  <span>
                    {title} {m.progress ?? 0}/{m.template?.target ?? 1}
                  </span>
                  <ProgressBar value={m.progress ?? 0} max={m.template?.target ?? 1} height={8} />
                </div>
              );
            })}
          </HudPanel>

          <div className="quick-stack">
            <GameButton
              compact
              variant="blue"
              icon={<IconGift />}
              onClick={() => {
                setScreen('missions');
                if (claimable) showToast(t.claim);
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
            <div style={{ position: 'relative' }}>
              <GameButton
                compact
                variant="blue"
                icon={<IconSpin />}
                onClick={() => setScreen('spin')}
              >
                {t.dailySpin}
              </GameButton>
              {player.spinAvailable ? <span className="notif-dot" /> : null}
            </div>
          </div>
        </div>

        <div className="hub-right">
          <HudPanel title={t.table} style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {top5.map((row) => (
              <div key={row.playerId} className={`lb-row${row.isSelf ? ' self' : ''}`}>
                <span style={{ width: 18 }}>{row.rank}</span>
                <span className="lb-avatar" />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.displayName}
                </span>
                <span>{(row.bestScore ?? 0).toLocaleString('es-DO')}</span>
              </div>
            ))}
          </HudPanel>

          <HudPanel title={t.skateboard} compact>
            <div className="skate-panel">
              <div className="skate-panel-left">
                <IconSkate size={36} />
                <div className="skate-count-row">
                  <strong>{charges}</strong>
                  <button
                    type="button"
                    aria-label="Buy skate"
                    onClick={() => setScreen('shop')}
                    className="plus-chip"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="skate-segments skate-segments--vertical">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`skate-seg${i < charges ? ' on' : ''}`} />
                ))}
              </div>
            </div>
          </HudPanel>
        </div>
      </div>

      <BottomNav onPlay={onPlay} />
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
    </>
  );
}

function BottomNav({ onPlay }: { onPlay: () => void }) {
  const t = useI18n();
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <div className="bottom-nav">
      <GameButton variant="red" hero icon={<IconPlay />} onClick={onPlay}>
        {t.play}
      </GameButton>
      <GameButton variant="blue" icon={<IconCart />} onClick={() => setScreen('shop')}>
        {t.shop}
      </GameButton>
      <GameButton variant="green" icon={<IconGear />} onClick={() => setScreen('settings')}>
        {t.settings}
      </GameButton>
    </div>
  );
}
