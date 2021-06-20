declare const browser: {
  storage: {
    sync: {
      set: (op: Options) => any,
      get: (key: Options) => Promise<Options>
    }
  }
};

export interface Options {
  ngUser: string,
  ngCode: string,
  ngKeyword: string,
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: string;
  customCacheHour: number;
  customCache: string;
}

export interface ParsedOptions {
  ngUser: string[],
  ngCode: string[],
  ngKeyword: string[],
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: string;
  customCache: Record<string, boolean>;
}

type Cache = {
  cache: Record<string, boolean>,
  updated: number
};

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
  customCache: '{}',
};

function parse(str: string): string[] {
  return str.split(delimiter);
}

function getCache(cache: Cache | { updated: undefined, cache: undefined }, options: Options)
  : Record<string, boolean> {
  if (typeof cache.updated !== 'number' || !cache.cache) return {};
  if (options.customCacheHour < 0 ||
    (new Date()).getTime() - cache.updated < options.customCacheHour * 1000 * 60 * 60
  ) {
    return cache.cache;
  }
  return {};
}

export namespace Settings {
  export function save(options: Options): void {
    browser.storage.sync.set(options);
  }

  export function load(): Promise<Options> {
    return browser.storage.sync.get(defaultOptions);
  }

  export function saveCustomCache(cache: Record<string, boolean>): void {
    const cacheBase: Cache = {
      cache,
      updated: (new Date()).getTime(),
    };
    const customCache: string = JSON.stringify(cacheBase as any);
    load().then((options) => save({...options, customCache}), console.error);
  }

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    const customCache = getCache(JSON.parse(options.customCache), options);
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      useCustomFilter: options.useCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customFilter: options.customFilter,
      customCache,
    };
  }

  export function getDefault(): Options {
    return defaultOptions;
  }
}
