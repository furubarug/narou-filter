export type Options = {
  ngUser: string,
  ngCode: string,
  ngKeyword: string,
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: string;
  customCacheHour: number;
}

type SyncOptions = Omit<Options, 'customFilter'>;

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

function getCache(cacheBase: unknown, customCacheHour: number): Cache {
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
    if (customCacheHour < 0 ||
      (new Date()).getTime() - v.updated < customCacheHour * 1000 * 60 * 60
    ) {
      newCache[key] = v;
    }
  });
  return newCache;
}

export namespace Settings {

  export async function save(options: Options) {
    const customFilter = options.customFilter;
    const syncOptions: SyncOptions = {
      ngUser: options.ngUser,
      ngCode: options.ngCode,
      ngKeyword: options.ngKeyword,
      useCustomFilter: options.useCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customCacheHour: options.customCacheHour,
    }; // clean
    await browser.storage.sync.set(syncOptions);
    await browser.storage.local.set({customFilter});
  }

  export async function load(): Promise<Options & { customCache: string }> {
    const syncOptions = await browser.storage.sync.get(defaultOptions);
    const {customFilter, customCache} = await browser.storage.local.get({
      customFilter: defaultFilter,
      customCache: '{}',
    }); // destructuring assignments to avoid overwriting
    return {...syncOptions, customFilter, customCache};
  }

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      useCustomFilter: options.useCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customFilter: options.customFilter,
      customCache: getCache(options.customCache, options.customCacheHour),
    };
  }

  export function saveCustomCache(cache: Cache): void {
    const customCache: string = JSON.stringify(cache as any);
    browser.storage.local.set({customCache}).then();
    load().then((options) => {
      if (!options.saveCustomNgUser) return;
      const customNg = [...Object.keys(cache)].filter((it) => cache[it]?.filter);
      const ngUsers = [...new Set([...parse(options.ngUser), ...customNg])];
      save({...options, ngUser: ngUsers.join(' ')}).then();
    });
  }

  export function getDefault(): Options {
    return {...defaultOptions};
  }
}
