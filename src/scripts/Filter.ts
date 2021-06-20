import {ParsedOptions, Settings} from './Settings';
import {AbstractNovelInfo} from './AbstractNovelInfo';

const customTargets: AbstractNovelInfo[] = [];
let cache: Record<string, boolean> = {};
let customIndex = 0;
let connecting = false;

export function applyFilter(target: AbstractNovelInfo[]): void {
  customTargets.splice(0);
  cache = {};
  customIndex = 0;
  Settings.loadParsed().then((options) => {
    cache = {...cache, ...options.customCache};
    target.forEach((it) => {
      if (
        options.ngCode.includes(it.ncode) ||
        options.ngUser.includes(it.userId) ||
        it.keyword?.some((word) => options.ngKeyword.includes(word))
      ) {
        it.disable();
      } else if (options.useCustomFilter && cache[it.userId] !== false) {
        applyCustomFilter(it, options);
      }
    });
  }, console.error);
}

function applyCustomFilter(target: AbstractNovelInfo, options: ParsedOptions): void {
  target.disable();
  customTargets.push(target);
  if (connecting) {
    return;
  }
  connecting = true;
  const AsyncFun = Object.getPrototypeOf(async () => {
  }).constructor;
  const filter = new AsyncFun('userId', 'ncode', options.customFilter);
  setTimeout(async () => {
    while (customIndex < customTargets.length) {
      const t = customTargets[customIndex++];
      if (cache[t.userId] !== undefined) {
        cache[t.userId] || t.enable();
      } else {
        const result = await custom(t.userId, t.ncode, filter);
        result || t.enable();
        cache[t.userId] = result;
        await sleep(30);
      }
    }
    connecting = false;
    if (options.useCustomFilter && options.saveCustomNgUser) {
      Settings.saveCustomCache(cache);
    }
  }, 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Filter = (userId: string, ncode: string) => Promise<any>;

async function custom(userId: string, ncode: string, filter: Filter): Promise<boolean> {
  try {
    return await filter(userId, ncode) === true;
  } catch (e) {
    console.error(e);
    return true;
  }
}
