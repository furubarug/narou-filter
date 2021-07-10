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
  return str.split(delimiter).filter((it) => it);
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
  try {
    const filter: CustomFilter | any = new AsyncFun('userId', 'ncode', 'allcount', 'data', filterBase);
    return async function(userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]): Promise<boolean> {
      try {
        return await filter(userId, ncode, allcount, data) === true;
      } catch (e) {
        console.error(e);
        return false;
      }
    };
  } catch (e) {
    console.error(e);
    return async (userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]) => false;
  }
}

export function createSimpleFilterBy(filterBase: SimpleFilter[]): CustomFilter {
  return async function(userId: string, ncode: string, allcount: number, data: ApiNovelInfo[]): Promise<boolean> {
    if (filterBase.length === 0) return false;
    const novels = convertBasedOnNovelType(ncode, data);
    if (Object.values(novels).some((it) => it.length === 0)) {
      console.error(ncode, data);
      return false;
    }
    const nowDateNumber = dateToNum(new Date());
    return filterBase.every((filterObj) => {
      const filteredData = novels[filterObj.novelType];
      if (filteredData.length === 0) return false;
      const targetType = getTypeOrNull(filteredData[0][filterObj.targetType]);
      const valueType = getTypeOrNull(filterObj.value);

      if (targetType === 'num' && valueType === 'num') {
        const v = Number(filterObj.value);
        if (Number.isNaN(v)) return false;
        const targets = filteredData.map((it) => it[filterObj.targetType]);
        if (targets.some((it) => typeof it !== 'number')) return false;
        const f = createValidatorByComType(v, filterObj.compType);
        if (f == null) return false;
        return calcByCalcType(targets as number[], filterObj.calcType, f);
      } else if (targetType === 'date' && valueType === 'date') {
        const d = new Date(filterObj.value);
        if (Number.isNaN(d.getTime())) return false;
        const v = dateToNum(d);
        const targets = convertToDateNumsOrNullByTargetType(filteredData, filterObj.targetType);
        if (!targets) return false;
        const f = createValidatorByComType(v, filterObj.compType);
        if (f == null) return false;
        return calcByCalcType(targets, filterObj.calcType, f);
      } else if (targetType === 'date' && valueType === 'num') {
        const v = Number(filterObj.value);
        if (Number.isNaN(v)) return false;
        const targets = convertToDateNumsOrNullByTargetType(filteredData, filterObj.targetType)
            ?.map((it) => Math.abs(it - nowDateNumber));
        if (!targets) return false;
        const f = createValidatorByComType(v, filterObj.compType);
        if (f == null) return false;
        return calcByCalcType(targets, filterObj.calcType, f);
      }
      return false;
    });
  };
}

export function convertBasedOnNovelType(ncode: string, data: ApiNovelInfo[])
  : Record<SimpleFilter['novelType'], ApiNovelInfo[]> {
  return {
    this: data.filter((it) => it.ncode.toLowerCase() == ncode.toLowerCase()),
    normal: data.filter((it) => it['novel_type'] === 1),
    short: data.filter((it) => it['novel_type'] === 2),
    all: data,
  };
}

export function getTypeOrNull(target: unknown): 'num' | 'date' | null {
  if (typeof target === 'number') return 'num';
  if (typeof target !== 'string') return null;
  if (!Number.isNaN(Number(target))) return 'num';
  return Number.isNaN(new Date(target).getTime()) ? null : 'date';
}

export function dateToNum(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function convertToDateNumsOrNullByTargetType(data: ApiNovelInfo[], type: SimpleFilter['targetType'])
  : number[] | null {
  let isValid = true;
  const v: number[] = data.map((it) => {
    if (!isValid) return 0;
    const s = it[type];
    if (typeof s !== 'string') {
      isValid = false;
      return 0;
    }
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) {
      isValid = false;
      return 0;
    }
    return dateToNum(d);
  });
  return isValid ? v : null;
}

export function createValidatorByComType(value: number, type: SimpleFilter['compType'])
  : ((n: number) => boolean) | null {
  switch (type) {
    case 'equal':
      return (n: number) => n === value;
    case 'not':
      return (n: number) => n !== value;
    case 'higher':
      return (n: number) => n > value;
    case 'lower':
      return (n: number) => n < value;
    default:
      return null;
  }
}

export function calcByCalcType(target: number[], type: SimpleFilter['calcType'], validator
  : (n: number) => boolean): boolean {
  switch (type) {
    case 'avg':
      return validator(target.reduce((a, c) => a + c, 0.0) / target.length);
    case 'sum':
      return validator(target.reduce((a, c) => a + c, 0.0));
    case 'every':
      return target.every((it) => validator(it));
    case 'some':
      return target.some((it) => validator(it));
    default:
      return false;
  }
}
