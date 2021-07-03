import {createCustomFilterBy, CustomCache, CustomFilter, getCache, parse} from './SettingsUtil';

type SyncOptions = {
  ngUser: string,
  ngCode: string,
  ngKeyword: string,
};
type LocalOptions = {
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: string;
  customCacheHour: number;
};

export type Options = SyncOptions & LocalOptions;

export type ParsedOptions = {
  ngUser: string[],
  ngCode: string[],
  ngKeyword: string[],
  useCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customFilter: CustomFilter;
  customCache: CustomCache;
}

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
  useCustomFilter: false,
  saveCustomNgUser: true,
  customFilter: defaultFilter,
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
      useCustomFilter: options.useCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customCacheHour: options.customCacheHour,
      customFilter: options.customFilter,
    };
    await browser.storage.sync.set(syncOptions);
    await browser.storage.local.set(localOptions);
  }

  export async function load(): Promise<Options & { customCache: string }> {
    const syncOptions = await browser.storage.sync.get(defaultSyncOptions);
    const localOptions = await browser.storage.local.get({...defaultLocalOptions, customCache: '{}'});
    return {...localOptions, ...syncOptions};
  }

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      useCustomFilter: options.useCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customFilter: createCustomFilterBy(options.customFilter),
      customCache: getCache(options.customCache, options.customCacheHour),
    };
  }

  export function saveCustomCache(cache: CustomCache): void {
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
