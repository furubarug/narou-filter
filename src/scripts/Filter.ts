import {ParsedOptions, Settings} from './Settings';
import {AbstractNovelInfo} from './AbstractNovelInfo';
import {getNovelInfoByUserId, sleep} from './NarouAPI';
import {CustomCache} from './SettingsUtil';

const customTargets: AbstractNovelInfo[] = [];
let cache: CustomCache = {};
let customIndex = 0;
let connecting = false;

export function applyFilter(target: AbstractNovelInfo[]): void {
  customTargets.splice(0);
  customIndex = 0;
  Settings.loadParsed().then((options) => {
    cache = {...options.customCache};
    target.forEach((it) => {
      if (
        options.ngCode.includes(it.ncode) ||
        options.ngUser.includes(it.userId) ||
        it.keyword?.some((word) => options.ngKeyword.includes(word))
      ) {
        it.disable();
      } else if (options.useCustomFilter && cache[it.userId]?.filter !== false) {
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
  const updated = (new Date()).getTime();
  setTimeout(async () => {
    while (customIndex < customTargets.length) {
      const t = customTargets[customIndex++];
      if (cache[t.userId] !== undefined) {
        cache[t.userId]?.filter || t.enable();
      } else {
        const [{allcount}, ...data] = await getNovelInfoByUserId(t.userId);
        const result = await options.customFilter(t.userId, t.ncode, allcount, data);
        result || t.enable();
        cache[t.userId] = {updated, filter: result};
        await sleep(100);
      }
    }
    connecting = false;
    if (options.useCustomFilter && options.saveCustomNgUser) {
      Settings.saveCustomCache(cache);
    }
  }, 0);
}

