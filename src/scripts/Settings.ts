export type Options = {
  ngUser: string,
  ngCode: string,
  ngKeyword: string,
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: string;
  customCacheHour: number;
}

export type ParsedOptions = {
  ngUser: string[],
  ngCode: string[],
  ngKeyword: string[],
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: string;
  customCache: Cache;
}

export type Cache = Record<string, undefined | { updated?: number, filter?: boolean }>;

const delimiter = /[\s,.|:;]+/;

const defaultFilter =
  `const url = \`https://api.syosetu.com/novelapi/api/?out=json&libtype=2&userid=\${userId}\`;
const res = await fetch(url);
const [count, ...data] = await res.json();
if (count.allcount < 2) return false;
const d = new Date();
d.setMonth(d.getMonth() - 2);
const date = d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 8);
return data.filter(it => it.end === 1 && it.novelupdated_at < date).length >= 3;`;

const defaultOptions: Options = {
  ngUser: '',
  ngCode: '',
  ngKeyword: '',
  useCustomFilter: false,
  saveCustomNgUser: true,
  customFilter: defaultFilter,
  customCacheHour: -1,
};

function parse(str: string): string[] {
  return str.split(delimiter);
}

function getCache(cacheBase: unknown, options: Options): Cache {
  if (typeof cacheBase !== 'string') return {};
  let cache: Cache;
  try {
    cache = JSON.parse(cacheBase);
  } catch (_) {
    return {};
  }
  if (typeof cache !== 'object') return {};
  const newCache: Cache = {};
  Object.keys(cache).forEach((key) => {
    const v = cache[key];
    if (!v || typeof v.updated !== 'number' || typeof v.filter !== 'boolean') {
      return;
    }
    if (options.customCacheHour < 0 ||
      (new Date()).getTime() - v.updated < options.customCacheHour * 1000 * 60 * 60
    ) {
      newCache[key] = v;
    }
  });
  return newCache;
}

export namespace Settings {

  export function save(options: Options): void {
    browser.storage.sync.set(options);
  }

  export function load(): Promise<Options> {
    return browser.storage.sync.get(defaultOptions);
  }

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    const local = await browser.storage.local.get({customCache: '{}'});
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      useCustomFilter: options.useCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customFilter: options.customFilter,
      customCache: getCache(local.customCache, options),
    };
  }

  export function saveCustomCache(cache: Cache): void {
    const customCache: string = JSON.stringify(cache as any);
    browser.storage.local.set({customCache});
  }

  export function getDefault(): Options {
    return defaultOptions;
  }
}
