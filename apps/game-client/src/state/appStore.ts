import { create } from 'zustand';
import type { LeaderboardEntry, MissionProgress, PlayerProfile, ShopItem } from '@cruza-rd/shared-types';
import { FULL_SHOP_CATALOG } from '@cruza-rd/shared-types';
import { api } from '../services/api';

export type Screen =
  | 'splash'
  | 'intro'
  | 'home'
  | 'onboarding'
  | 'runner'
  | 'pause'
  | 'gameover'
  | 'revive'
  | 'missions'
  | 'leaderboard'
  | 'shop'
  | 'spin'
  | 'settings'
  | 'characters'
  | 'help'
  | 'offline'
  | 'debug';

interface AppState {
  screen: Screen;
  overlay: Screen | null;
  player: PlayerProfile | null;
  missions: MissionProgress[];
  leaderboard: LeaderboardEntry[];
  shopItems: ShopItem[];
  toast: string | null;
  soundOn: boolean;
  musicOn: boolean;
  vibrationOn: boolean;
  reduceMotion: boolean;
  loading: boolean;
  offline: boolean;
  lastRun: {
    score: number;
    multiplier: number;
    coins: number;
    picaPollo: number;
    distance: number;
    isRecord: boolean;
  } | null;
  pendingRevive: boolean;
  revivesUsedThisRun: number;
  runNonce: number;
  splashProgress: number;
  /** Epoch ms of the next daily mission reset — persisted so the countdown survives reloads. */
  missionsResetAt: number;
  rollMissionsWindow: () => void;
  /** Atomic end-of-run wallet commit: session totals fold into the persistent profile once. */
  commitRunToWallet: (run: RunCommit) => void;
  /** Deducts the configured extra-spin price. Returns false when the player cannot afford it. */
  payForExtraSpin: (price: { tickets: number; coins: number }) => boolean;
  setSplashProgress: (n: number) => void;
  setScreen: (s: Screen) => void;
  setOverlay: (s: Screen | null) => void;
  showToast: (msg: string) => void;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  setPlayer: (p: PlayerProfile) => void;
  setMissions: (m: MissionProgress[]) => void;
  setLastRun: (r: AppState['lastRun']) => void;
  setAudio: (k: 'soundOn' | 'musicOn' | 'vibrationOn' | 'reduceMotion', v: boolean) => void;
  requestRevive: () => void;
  clearPendingRevive: () => void;
  bumpRevive: () => void;
  resetRunMeta: () => void;
  bumpRunNonce: () => void;
}

export interface RunCommit {
  score: number;
  multiplier: number;
  /** Coins collected during this single run (sessionCoins), not the wallet total. */
  sessionCoins: number;
  picaPollo: number;
  skateCharges: number;
}

const MISSIONS_RESET_KEY = 'cruza.missionsResetAt';

/** Next local midnight — daily missions roll over per player-local day, not per session. */
function nextLocalMidnight(from = Date.now()): number {
  const d = new Date(from);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function loadMissionsResetAt(): number {
  try {
    const raw = Number(localStorage.getItem(MISSIONS_RESET_KEY) || 0);
    if (raw > Date.now()) return raw;
  } catch {
    /* storage blocked — fall through to a fresh window */
  }
  const next = nextLocalMidnight();
  try {
    localStorage.setItem(MISSIONS_RESET_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

const defaultLocalPlayer = (): PlayerProfile => ({
  id: 'local',
  displayName: 'Tú',
  countryCode: 'DO',
  coins: 831,
  picaPolloTickets: 78,
  skateboardCharges: 8,
  bestScore: localStorage.getItem('cruza.onboarding') === '1' ? 24350 : 0,
  lastScore: localStorage.getItem('cruza.onboarding') === '1' ? 12499 : 0,
  lastMultiplier: 4,
  totalRuns: localStorage.getItem('cruza.onboarding') === '1' ? 3 : 0,
  totalDistance: 0,
  dailyLoginStreak: 1,
  onboardingSeen: localStorage.getItem('cruza.onboarding') === '1',
  isFirstLaunch: localStorage.getItem('cruza.onboarding') !== '1',
  equippedSkins: {
    character: 'default',
    backpack: 'rd',
    skateboard: 'flame',
  },
  ownedSkins: ['default', 'rd', 'flame'],
  adsRemoved: false,
  spinAvailable: true,
  loginRewardAvailable: true,
});

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'splash',
  overlay: null,
  player: null,
  missions: [],
  leaderboard: [],
  shopItems: [],
  toast: null,
  soundOn: localStorage.getItem('cruza.sound') !== '0',
  musicOn: localStorage.getItem('cruza.music') !== '0',
  vibrationOn: localStorage.getItem('cruza.vib') !== '0',
  reduceMotion:
    localStorage.getItem('cruza.reduceMotion') === '1' ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  loading: true,
  offline: false,
  lastRun: null,
  pendingRevive: false,
  revivesUsedThisRun: 0,
  runNonce: 0,
  splashProgress: 0,
  missionsResetAt: loadMissionsResetAt(),

  rollMissionsWindow: () => {
    const next = nextLocalMidnight();
    try {
      localStorage.setItem(MISSIONS_RESET_KEY, String(next));
    } catch {
      /* ignore */
    }
    set({ missionsResetAt: next });
    void get().refresh();
  },

  commitRunToWallet: (run) => {
    const p = get().player;
    if (!p) return;
    set({
      player: {
        ...p,
        coins: p.coins + run.sessionCoins,
        picaPolloTickets: p.picaPolloTickets + run.picaPollo,
        lastScore: run.score,
        lastMultiplier: run.multiplier,
        bestScore: Math.max(p.bestScore ?? 0, run.score),
        skateboardCharges: run.skateCharges,
        totalRuns: (p.totalRuns ?? 0) + 1,
        isFirstLaunch: false,
        onboardingSeen: true,
      },
    });
  },

  payForExtraSpin: (price) => {
    const p = get().player;
    if (!p) return false;
    if (p.picaPolloTickets >= price.tickets) {
      set({ player: { ...p, picaPolloTickets: p.picaPolloTickets - price.tickets } });
      return true;
    }
    if (p.coins >= price.coins) {
      set({ player: { ...p, coins: p.coins - price.coins } });
      return true;
    }
    return false;
  },

  setSplashProgress: (splashProgress) => set({ splashProgress }),
  setScreen: (screen) => set({ screen, overlay: null }),
  setOverlay: (overlay) => set({ overlay }),
  showToast: (toast) => {
    set({ toast });
    window.setTimeout(() => {
      if (get().toast === toast) set({ toast: null });
    }, 2200);
  },
  setPlayer: (player) => set({ player }),
  setMissions: (missions) => set({ missions }),
  setLastRun: (lastRun) => set({ lastRun }),
  requestRevive: () => set({ pendingRevive: true }),
  clearPendingRevive: () => set({ pendingRevive: false }),
  bumpRevive: () => set({ revivesUsedThisRun: get().revivesUsedThisRun + 1 }),
  resetRunMeta: () => set({ revivesUsedThisRun: 0, pendingRevive: false }),
  bumpRunNonce: () => set({ runNonce: get().runNonce + 1, revivesUsedThisRun: 0, pendingRevive: false }),
  setAudio: (k, v) => {
    const key =
      k === 'soundOn'
        ? 'cruza.sound'
        : k === 'musicOn'
          ? 'cruza.music'
          : k === 'reduceMotion'
            ? 'cruza.reduceMotion'
            : 'cruza.vib';
    localStorage.setItem(key, v ? '1' : '0');
    set({ [k]: v });
    if (k === 'reduceMotion') {
      document.documentElement.classList.toggle('reduce-motion', v);
    }
  },

  bootstrap: async () => {
    set({ loading: true });
    try {
      const player = await api.ensureGuest();
      if (!player?.id) throw new Error('Invalid player payload');
      const [missions, leaderboard, shopItems] = await Promise.all([
        api.missions().catch(() => [] as MissionProgress[]),
        api.leaderboard('global').catch(() => [] as LeaderboardEntry[]),
        api.shopItems().catch(() => [] as ShopItem[]),
      ]);
      const seen = localStorage.getItem('cruza.onboarding') === '1';
      set({
        player: {
          ...player,
          onboardingSeen: player.onboardingSeen || seen,
          isFirstLaunch: !(player.onboardingSeen || seen),
        },
        missions: Array.isArray(missions) ? missions : [],
        leaderboard: Array.isArray(leaderboard) ? leaderboard : [],
        shopItems: Array.isArray(shopItems) ? shopItems : [],
        offline: false,
        loading: false,
      });
    } catch {
      const player = defaultLocalPlayer();
      set({
        player,
        missions: localMissions(),
        leaderboard: localLeaderboard(player),
        shopItems: localShop(),
        offline: true,
        loading: false,
      });
    }
  },

  refresh: async () => {
    try {
      const [player, missions, leaderboard] = await Promise.all([
        api.me(),
        api.missions(),
        api.leaderboard('global'),
      ]);
      set({
        player,
        missions: Array.isArray(missions) ? missions : [],
        leaderboard: Array.isArray(leaderboard) ? leaderboard : [],
        offline: false,
      });
    } catch {
      set({ offline: true });
    }
  },
}));

function localMissions(): MissionProgress[] {
  return [
    {
      missionTemplateId: 'daily_collect_500',
      progress: 320,
      completed: false,
      claimed: false,
      template: {
        id: 'daily_collect_500',
        type: 'collect_coins',
        title: { 'es-DO': 'Recoge 500 monedas', en: 'Collect 500 coins' },
        target: 500,
        rewardCoins: 100,
        rewardPicaPollo: 0,
        scope: 'daily',
      },
    },
    {
      missionTemplateId: 'daily_jump_20',
      progress: 12,
      completed: false,
      claimed: false,
      template: {
        id: 'daily_jump_20',
        type: 'jump_count',
        title: { 'es-DO': 'Salta 20 veces', en: 'Jump 20 times' },
        target: 20,
        rewardCoins: 75,
        rewardPicaPollo: 0,
        scope: 'daily',
      },
    },
    {
      missionTemplateId: 'daily_skateboard_5',
      progress: 2,
      completed: false,
      claimed: false,
      template: {
        id: 'daily_skateboard_5',
        type: 'use_powerup',
        title: { 'es-DO': 'Usa patineta 5 veces', en: 'Use skateboard 5 times' },
        target: 5,
        rewardCoins: 80,
        rewardPicaPollo: 1,
        scope: 'daily',
      },
    },
    {
      missionTemplateId: 'daily_pica_pollo_100',
      progress: 78,
      completed: false,
      claimed: false,
      template: {
        id: 'daily_pica_pollo_100',
        type: 'collect_pica_pollo',
        title: { 'es-DO': 'Recoge Pica Pollo', en: 'Collect Pica Pollo' },
        target: 100,
        rewardCoins: 150,
        rewardPicaPollo: 5,
        scope: 'daily',
      },
    },
  ];
}

function localLeaderboard(self: PlayerProfile): LeaderboardEntry[] {
  return [
    { rank: 1, playerId: 'b1', displayName: 'ElMaestro', bestScore: 48200 },
    { rank: 2, playerId: 'b2', displayName: 'QuítateRD', bestScore: 35100 },
    {
      rank: 3,
      playerId: self.id,
      displayName: self.displayName,
      bestScore: self.lastScore || 12499,
      isSelf: true,
    },
    { rank: 4, playerId: 'b4', displayName: 'OMSAKing', bestScore: 9800 },
    { rank: 5, playerId: 'b5', displayName: 'PicaPollo', bestScore: 7600 },
  ];
}

function localShop(): ShopItem[] {
  return FULL_SHOP_CATALOG;
}
