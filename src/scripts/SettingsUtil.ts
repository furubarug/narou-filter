import {ApiNovelInfo} from './NarouAPI';

export type CustomCache = Record<string, undefined | { updated?: number, filter?: boolean }>;
export type CustomFilter = (userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]) => Promise<boolean>;
export type SimpleFilter = {
  novelType: 'this' | 'normal' | 'short' | 'all', // 小説, 作者の長編, 作者の短編, 作者の小説
  targetType: 'biggenre' | 'genre' | 'general_firstup' | 'general_lastup' | 'novel_type' | 'end' |
    'general_all_no' | 'length' | 'isstop' | 'fav_novel_cnt' | 'impression_cnt' | 'review_cnt' |
    'all_point' | 'all_hyoka_cnt' | 'novelupdated_at',
  calcType: 'sum' | 'avg' | 'every' | 'some', // 合計, 平均, すべて, いずれか
  value: string,
  compType: 'equal' | 'not' | 'lower' | 'higher', // である, でない, より小さい, より大きい
};

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

export function convertCacheToString(cache: CustomCache, base: string): string {
  const customNg = [...Object.keys(cache)].filter((it) => cache[it]?.filter);
  return [...new Set([...parse(base), ...customNg])].join(' ');
}

const AsyncFun = Object.getPrototypeOf(async () => {
}).constructor;

export function cleanSimpleFilter(filter: SimpleFilter[]): SimpleFilter[] {
  return filter.map((it) => ({
    novelType: it.novelType,
    targetType: it.targetType,
    calcType: it.calcType,
    value: it.value,
    compType: it.compType,
  }));
}

export function createCustomFilterBy(filterBase: string): CustomFilter {
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

export function createSimpleFilterBy(filterBase: SimpleFilter[]): CustomFilter {
  return async function(userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]): Promise<boolean> {
    if (filterBase.length === 0) return false;
    const novel = data.filter((it) => it.ncode.toLowerCase() === ncode);
    if (novel.length === 0) {
      console.error(ncode);
      console.error(data);
    }
    const normal = data.filter((it) => it['novel_type'] === 1);
    const short = data.filter((it) => it['novel_type'] === 2);
    return filterBase.every((filterObj) => {
      const mappedTarget = (() => {
        switch (filterObj.novelType) {
          case 'this':
            return novel;
          case 'normal':
            return normal;
          case 'short':
            return short;
          default:
            return data;
        }
      })().map((it) => it[filterObj.targetType]);
      if (mappedTarget.length === 0) return false;
      const isDateAndNumber = typeof mappedTarget[0] !== 'number' && filterObj.value.match(/^\d*$/);
      const value: number = typeof mappedTarget[0] === 'number' || isDateAndNumber ?
        Number(filterObj.value) : new Date(filterObj.value).getTime();
      if (Number.isNaN(value)) return false;
      const target = mappedTarget.map((it) => typeof it === 'number' ? it : new Date(it).getTime());
      if (target.some((it) => Number.isNaN(it))) return false;

      const nowTime = new Date().getTime();
      const validate: (n: number) => boolean = (n: number) => {
        const num = isDateAndNumber ? Math.floor(Math.abs(nowTime - n) / (24 * 60 * 60 * 1000)) : n;
        switch (filterObj.compType) {
          case 'equal':
            return num === value;
          case 'not':
            return num !== value;
          case 'higher':
            return num > value;
          case 'lower':
            return num < value;
          default:
            return false;
        }
      };
      switch (filterObj.calcType) {
        case 'avg':
          if (validate(target.reduce((a, c) => a + c, 0.0) / target.length)) return true;
          break;
        case 'sum':
          if (validate(target.reduce((a, c) => a + c, 0.0))) return true;
          break;
        case 'every':
          if (target.every((it) => validate(it))) return true;
          break;
        case 'some':
          if (target.some((it) => validate(it))) return true;
          break;
        default:
          break;
      }
      return false;
    });
  };
}
