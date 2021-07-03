import {ApiNovelInfo} from './NarouAPI';

export type CustomCache = Record<string, undefined | { updated?: number, filter?: boolean }>;
export type CustomFilter = (userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]) => Promise<boolean>;

const delimiter = /[\s,.|:;]+/;

export function parse(str: string): string[] {
  return str.split(delimiter);
}

export function getCache(cacheBase: unknown, customCacheHour: number): CustomCache {
  if (typeof cacheBase !== 'string') return {};
  let cache: CustomCache;
  try {
    cache = JSON.parse(cacheBase);
  } catch (_) {
    return {};
  }
  if (typeof cache !== 'object') return {};
  const newCache: CustomCache = {};
  Object.keys(cache).forEach((key) => {
    const v = cache[key];
    if (!v || typeof v.updated !== 'number' || typeof v.filter !== 'boolean') {
      return;
    }
    if (customCacheHour < 0 ||
      (new Date()).getTime() - v.updated < customCacheHour * 1000 * 60 * 60
    ) {
      newCache[key] = v;
    }
  });
  return newCache;
}

export function createCustomFilterBy(filterBase: string): CustomFilter {
  const AsyncFun = Object.getPrototypeOf(async () => {
  }).constructor;
  const filter: CustomFilter | any = new AsyncFun('userId', 'ncode', 'allcount', 'data', filterBase);
  return async function(userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]): Promise<boolean> {
    try {
      return await filter(userId, ncode, allcount, data) === true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
}
