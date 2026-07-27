import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@cruza-rd/shared-types';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { useAppStore } from '../state/appStore';
import { GameButton } from '../ui/GameButton';
import { HudPanel } from '../ui/HudPanel';

type Tab = 'global' | 'weekly' | 'friends';

export function LeaderboardScreen() {
  const t = useI18n();
  const { leaderboard, player, setScreen, showToast } = useAppStore();
  const [tab, setTab] = useState<Tab>('global');
  const [rows, setRows] = useState<LeaderboardEntry[]>(leaderboard);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (tab === 'friends') {
        const self: LeaderboardEntry[] = player
          ? [
              {
                rank: 1,
                playerId: player.id,
                displayName: player.displayName,
                bestScore: player.bestScore,
                isSelf: true,
              },
            ]
          : [];
        setRows(self);
        return;
      }
      setLoading(true);
      try {
        const data = await api.leaderboard(tab);
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          setRows(leaderboard);
          showToast(e instanceof Error ? e.message : 'Error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tab, leaderboard, player, showToast]);

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <GameButton compact variant="navy" style={{ width: 'auto' }} onClick={() => setScreen('home')}>
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
          {t.ranking}
        </h1>
      </div>

      <div className="tabs">
        {(
          [
            ['global', t.global],
            ['weekly', t.weekly],
            ['friends', t.friends],
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

      <HudPanel style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>…</p>
        ) : (
          rows.map((row) => (
            <div key={row.playerId} className={`lb-row${row.isSelf ? ' self' : ''}`}>
              <span style={{ width: 22, fontWeight: 800 }}>{row.rank}</span>
              <span className="lb-avatar" aria-hidden />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.displayName}
              </span>
              <span style={{ color: 'var(--ui-gold-bright)' }}>
                {row.bestScore.toLocaleString('es-DO')}
              </span>
            </div>
          ))
        )}
      </HudPanel>
    </div>
  );
}
