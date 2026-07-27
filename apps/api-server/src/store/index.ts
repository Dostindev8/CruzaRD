import { MemoryStore } from './memoryStore.js';
import type { IStore } from './types.js';

/**
 * Store singleton.
 *
 * Local DoD: MemoryStore (Map) — no MongoDB.
 * Production later: swap for MongoStore implementing IStore, e.g.:
 *   export const store: IStore = process.env.MONGODB_URI
 *     ? new MongoStore(process.env.MONGODB_URI)
 *     : new MemoryStore();
 */
export const store: IStore = new MemoryStore();

export type { IStore } from './types.js';
