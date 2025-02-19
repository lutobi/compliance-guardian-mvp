import { cacheData } from './cache';

type CacheConfig = {
  key: string;
  ttl?: number;
};

export function withCache<T>(
  fn: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  const cached = cacheData.get<T>(config.key);
  if (cached) return Promise.resolve(cached);

  return fn().then((data) => {
    if (data) cacheData.set(config.key, data);
    return data;
  });
}

export function clearCache(key?: string) {
  if (key) {
    cacheData.delete(key);
  } else {
    cacheData.clear();
  }
}
