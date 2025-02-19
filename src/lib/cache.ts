type CacheItem<T> = {
  data: T;
  timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheItem<unknown>>();

export const cacheData = {
  set: <T>(key: string, data: T) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  get: <T>(key: string): T | null => {
    const item = cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > CACHE_DURATION;
    if (isExpired) {
      cache.delete(key);
      return null;
    }

    return item.data as T;
  },

  clear: () => {
    cache.clear();
  },

  delete: (key: string) => {
    cache.delete(key);
  },
};
