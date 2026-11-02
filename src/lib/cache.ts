/**
 * Minimal cache abstraction so the in-memory store can be swapped for
 * Cloudflare KV (or anything else) without touching the Movember adapter.
 */
export interface CacheEntry<T> {
  value: T;
  /** Epoch milliseconds when the value was stored. */
  storedAt: number;
}

export interface CacheStore<T> {
  get(key: string): Promise<CacheEntry<T> | undefined>;
  set(key: string, entry: CacheEntry<T>): Promise<void>;
}

/**
 * Module-level memory cache. On Cloudflare this lives for the lifetime of
 * the worker isolate, which is plenty for a 15 minute TTL.
 */
export function createMemoryCache<T>(): CacheStore<T> {
  const store = new Map<string, CacheEntry<T>>();
  return {
    async get(key) {
      return store.get(key);
    },
    async set(key, entry) {
      store.set(key, entry);
    },
  };
}
