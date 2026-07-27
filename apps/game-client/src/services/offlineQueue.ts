import type { RunPayload } from '@cruza-rd/shared-types';
import { api } from './api';

const KEY = 'cruza.runQueue';

function read(): RunPayload[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as RunPayload[];
  } catch {
    return [];
  }
}

function write(q: RunPayload[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueueRun(payload: RunPayload) {
  const q = read();
  q.push(payload);
  write(q.slice(-30));
}

export async function flushRunQueue() {
  const q = read();
  if (!q.length) return;
  const remaining: RunPayload[] = [];
  for (const item of q) {
    try {
      await api.submitRun(item);
    } catch {
      remaining.push(item);
    }
  }
  write(remaining);
}
