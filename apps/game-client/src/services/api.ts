import type {
  LeaderboardEntry,
  MissionProgress,
  PlayerProfile,
  RunPayload,
  RunResult,
  ShopItem,
  SpinResult,
} from '@cruza-rd/shared-types';

const API = '/api/v1';

function deviceId(): string {
  const key = 'cruza.deviceId';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function token(): string | null {
  return localStorage.getItem('cruza.token');
}

function setToken(t: string) {
  localStorage.setItem('cruza.token', t);
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  const tok = token();
  if (tok) headers.Authorization = `Bearer ${tok}`;

  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as Record<string, string>));
    throw new Error(
      (body as { error?: string; message?: string }).error ||
        (body as { message?: string }).message ||
        `HTTP ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

function unwrapPlayer(data: PlayerProfile | { player: PlayerProfile }): PlayerProfile {
  if (data && typeof data === 'object' && 'player' in data && (data as { player: PlayerProfile }).player) {
    return (data as { player: PlayerProfile }).player;
  }
  return data as PlayerProfile;
}

export const api = {
  async ensureGuest(): Promise<PlayerProfile> {
    if (!token()) {
      const data = await req<{ accessToken: string; player: PlayerProfile }>('/auth/guest', {
        method: 'POST',
        body: JSON.stringify({ deviceId: deviceId() }),
      });
      setToken(data.accessToken);
      return data.player;
    }
    return api.me();
  },

  async me(): Promise<PlayerProfile> {
    const data = await req<PlayerProfile | { player: PlayerProfile }>('/player/me');
    return unwrapPlayer(data);
  },

  submitRun: (payload: RunPayload) =>
    req<RunResult>('/runs', { method: 'POST', body: JSON.stringify(payload) }),

  missions: async () => {
    const data = await req<MissionProgress[] | { missions: MissionProgress[] }>('/missions');
    return Array.isArray(data) ? data : data.missions ?? [];
  },

  claimMission: (id: string) =>
    req<{ player: PlayerProfile; missions: MissionProgress[] }>(`/missions/${id}/claim`, {
      method: 'POST',
    }),

  leaderboard: async (scope: 'global' | 'weekly' = 'global') => {
    const data = await req<LeaderboardEntry[] | { entries: LeaderboardEntry[] }>(
      `/leaderboard?scope=${scope}`,
    );
    return Array.isArray(data) ? data : data.entries ?? [];
  },

  spin: () => req<SpinResult>('/spin/daily', { method: 'POST' }),

  claimLogin: () =>
    req<{ player: PlayerProfile; rewardCoins: number }>('/login-reward/claim', {
      method: 'POST',
    }),

  shopItems: async () => {
    const data = await req<ShopItem[] | { items: ShopItem[] }>('/shop/items');
    return Array.isArray(data) ? data : data.items ?? [];
  },

  purchase: (itemId: string) =>
    req<{ player: PlayerProfile }>('/shop/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),
};
