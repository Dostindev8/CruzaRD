import { useMemo, useState } from 'react';
import { getLocale } from '../i18n';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';
import { ProgressBar } from '../ui/ProgressBar';
import type { MissionScope } from '@cruza-rd/shared-types';

type Tab = MissionScope;

export function MissionsScreen() {
  const t = useI18n();
  const { missions, setMissions, setPlayer, setScreen, showToast } = useAppStore();
  const [tab, setTab] = useState<Tab>('daily');
  const [busy, setBusy] = useState<string | null>(null);
  const locale = getLocale();

  const filtered = useMemo(
    () => missions.filter((m) => m.template.scope === tab),
    [missions, tab],
  );

  const claim = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      const res = await api.claimMission(id);
      setPlayer(res.player);
      setMissions(res.missions);
      showToast(t.missionComplete);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="screen">
      <Header title={t.missions} onBack={() => setScreen('home')} />

      <div className="tabs">
        {(
          [
            ['daily', t.daily],
            ['weekly', t.weekly],
            ['achievement', t.achievements],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }} className="stack-gap">
        {filtered.length === 0 ? (
          <HudPanel>
            <p style={{ margin: 0, textAlign: 'center', opacity: 0.7, fontSize: '0.85rem' }}>
              —
            </p>
          </HudPanel>
        ) : (
          filtered.map((m) => {
            const title =
              m.template.title[locale] ?? m.template.title['es-DO'] ?? m.template.title.en;
            const canClaim = m.completed && !m.claimed;
            return (
              <HudPanel key={m.missionTemplateId}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
                    {title}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ui-gold)' }}>
                    +{m.template.rewardCoins}🪙
                  </span>
                </div>
                <ProgressBar value={m.progress} max={m.template.target} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {m.progress}/{m.template.target}
                  </span>
                  <GameButton
                    compact
                    variant={canClaim ? 'green' : 'navy'}
                    disabled={!canClaim || busy === m.missionTemplateId}
                    style={{ width: 'auto', minWidth: 110 }}
                    onClick={() => void claim(m.missionTemplateId)}
                  >
                    {m.claimed ? '✓' : t.claim}
                  </GameButton>
                </div>
              </HudPanel>
            );
          })
        )}
      </div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <GameButton compact variant="navy" style={{ width: 'auto' }} onClick={onBack}>
        ←
      </GameButton>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.25rem',
          WebkitTextStroke: '1px #000',
        }}
      >
        {title}
      </h1>
    </div>
  );
}
