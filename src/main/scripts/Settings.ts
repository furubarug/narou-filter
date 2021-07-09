import {
  cleanSimpleFilter,
  convertCacheToString,
  createCustomFilterBy,
  createSimpleFilterBy,
  CustomCache,
  CustomFilter,
  getCache,
  parse,
  SimpleFilter,
} from './SettingsUtil';

type SyncOptions = {
  ngUser: string,
  ngCode: string,
  ngKeyword: string,
};
type LocalOptions = {
  useCustomNgUserFilter: boolean;
  saveCustomNgUser: boolean;
  customNgUserFilter: string;
  useSimpleUserFilter: boolean;
  simpleNgUserFilter: SimpleFilter[];
  useCustomNgNovelFilter: boolean;
  saveCustomNgNovel: boolean;
  customNgNovelFilter: string;
  useSimpleNovelFilter: boolean;
  simpleNgNovelFilter: SimpleFilter[];
  customCacheHour: number;
};

export type Options = SyncOptions & LocalOptions;

export type ParsedOptions = {
  ngUser: string[],
  ngCode: string[],
  ngKeyword: string[],
  useCustomNgUserFilter: boolean;
  saveCustomNgUser: boolean;
  customNgUserFilter: CustomFilter;
  customNgUserCache: CustomCache;
  useCustomNgNovelFilter: boolean;
  saveCustomNgNovel: boolean;
  customNgNovelFilter: CustomFilter;
  customNgNovelCache: CustomCache;
}

type StringCaches = {
  customNgUserCache: string;
  customNgNovelCache: string;
};

const defaultFilter =
  `if (allcount < 2) return false;
const d = new Date();
d.setMonth(d.getMonth() - 2);
const date = d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 8);
return data.filter(it => it.end === 1 && it.novelupdated_at < date).length >= 3;`;

const defaultSyncOptions: SyncOptions = {
  ngUser: '',
  ngCode: '',
  ngKeyword: '',
};

const defaultLocalOptions: LocalOptions = {
  useCustomNgUserFilter: false,
  saveCustomNgUser: true,
  customNgUserFilter: defaultFilter,
  useSimpleUserFilter: true,
  simpleNgUserFilter: [],
  useCustomNgNovelFilter: false,
  saveCustomNgNovel: true,
  customNgNovelFilter: defaultFilter,
  useSimpleNovelFilter: true,
  simpleNgNovelFilter: [],
  customCacheHour: -1,
};

const defaultOptions: Options = {...defaultLocalOptions, ...defaultSyncOptions};

export namespace Settings {

  export async function save(options: Options) {
    // recreate objects to clean for saving
    const syncOptions: SyncOptions = {
      ngUser: options.ngUser,
      ngCode: options.ngCode,
      ngKeyword: options.ngKeyword,
    };
    const localOptions: LocalOptions = {
      useCustomNgUserFilter: options.useCustomNgUserFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customNgUserFilter: options.customNgUserFilter,
      useSimpleUserFilter: options.useSimpleUserFilter,
      simpleNgUserFilter: cleanSimpleFilter(options.simpleNgUserFilter),
      useCustomNgNovelFilter: options.useCustomNgNovelFilter,
      saveCustomNgNovel: options.saveCustomNgNovel,
      customNgNovelFilter: options.customNgNovelFilter,
      useSimpleNovelFilter: options.useSimpleNovelFilter,
      simpleNgNovelFilter: cleanSimpleFilter(options.simpleNgNovelFilter),
      customCacheHour: options.customCacheHour,
    };
    await browser.storage.sync.set(syncOptions);
    await browser.storage.local.set(localOptions);
  }

  export async function load(): Promise<Options & StringCaches> {
    const syncOptions: SyncOptions = await browser.storage.sync.get(defaultSyncOptions);
    const localOptions: LocalOptions & StringCaches = await browser.storage.local.get({
      ...defaultLocalOptions,
      customNgUserCache: '{}',
      customNgNovelCache: '{}',
    });
    return {...localOptions, ...syncOptions};
  }

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      useCustomNgUserFilter: options.useCustomNgUserFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customNgUserFilter: options.useSimpleUserFilter ?
        createSimpleFilterBy(options.simpleNgUserFilter) : createCustomFilterBy(options.customNgUserFilter),
      customNgUserCache: getCache(options.customNgUserCache, options.customCacheHour),
      useCustomNgNovelFilter: options.useCustomNgNovelFilter,
      saveCustomNgNovel: options.saveCustomNgNovel,
      customNgNovelFilter: options.useSimpleNovelFilter ?
        createSimpleFilterBy(options.simpleNgNovelFilter) : createCustomFilterBy(options.customNgNovelFilter),
      customNgNovelCache: getCache(options.customNgNovelCache, options.customCacheHour),
    };
  }

  export function saveCustomCaches({
    ngUserCache,
    ngNovelCache,
  }: { ngUserCache?: CustomCache, ngNovelCache?: CustomCache }): void {
    if (!ngUserCache && !ngNovelCache) return;
    const customCaches: Partial<StringCaches> = {};
    if (ngUserCache) customCaches.customNgUserCache = JSON.stringify(ngUserCache as any);
    if (ngNovelCache) customCaches.customNgNovelCache = JSON.stringify(ngNovelCache as any);
    browser.storage.local.set(customCaches).then();
    load().then((options) => {
      if (!options.saveCustomNgUser && !options.saveCustomNgNovel) return;
      const saveObj = {...options};
      if (options.saveCustomNgUser && ngUserCache) {
        saveObj.ngUser = convertCacheToString(ngUserCache, options.ngUser);
      }
      if (options.saveCustomNgNovel && ngNovelCache) {
        saveObj.ngCode = convertCacheToString(ngNovelCache, options.ngCode);
      }
      save(saveObj).then();
    });
  }

  export function getDefault(): Options {
    return {...defaultOptions};
  }
}
