interface Entry<T> {
  data: T;
  ts: number;
}

const store = new Map<string, Entry<unknown>>();
const DEFAULT_TTL_MS = 60_000;

export function getCached<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, ts: Date.now() });
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function clearAllCache(): void {
  store.clear();
}

export const permissionCacheKey = (appCode: string, userId: string) =>
  `perms:${appCode}:${userId}`;

/**
 * supabase-js caches channels by topic. Reusing a static name after a remount
 * makes `.on()` run after `subscribe()` and throws. Always unique-suffix.
 */
export function uniqueChannelName(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}
