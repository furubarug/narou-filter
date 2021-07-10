import {ParsedOptions, Settings} from './Settings';
import {AbstractNovelInfo} from './AbstractNovelInfo';
import {getNovelInfoByUserId, sleep} from './NarouAPI';
import {CustomCache} from './SettingsUtil';

const customTargets: AbstractNovelInfo[] = [];
let userCache: CustomCache = {};
let novelCache: CustomCache = {};
let customIndex = 0;
let connecting = false;

export function applyFilter(target: AbstractNovelInfo[]): void {
  customTargets.splice(0);
  customIndex = 0;
  Settings.loadParsed().then((options) => {
    userCache = {...options.customNgUserCache};
    novelCache = {...options.customNgNovelCache};
    target.forEach((it) => {
      if (
        options.ngCode.includes(it.ncode) ||
        options.ngUser.includes(it.userId) ||
        it.keyword?.some((word) => options.ngKeyword.includes(word))
      ) {
        it.disable();
      } else if (
        (options.useCustomNgUserFilter || options.useCustomNgNovelFilter) &&
        (options.useCustomNgUserFilter ? userCache[it.userId]?.filter !== false : true) &&
        (options.useCustomNgNovelFilter ? novelCache[it.userId]?.filter !== false : true)
      ) {
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
      if (options.useCustomNgUserFilter && userCache[t.userId] !== undefined) {
        userCache[t.userId]?.filter || t.enable();
        continue;
      }
      if (options.useCustomNgNovelFilter && novelCache[t.ncode] !== undefined) {
        novelCache[t.ncode]?.filter || t.enable();
        continue;
      }
      const [{allcount}, ...data] = await getNovelInfoByUserId(t.userId);
      let userResult = false;
      if (options.useCustomNgUserFilter) {
        userResult = await options.customNgUserFilter(t.userId, t.ncode, allcount, data);
        userCache[t.userId] = {updated, filter: userResult};
      }
      let novelResult = false;
      if (options.useCustomNgNovelFilter) {
        novelResult = await options.customNgNovelFilter(t.userId, t.ncode, allcount, data);
        novelCache[t.ncode] = {updated, filter: novelResult};
      }
      userResult || novelResult || t.enable();
      await sleep(100);
    }
    connecting = false;
    Settings.saveCustomCaches({
      ngUserCache: options.useCustomNgUserFilter && options.saveCustomNgUser ? userCache : undefined,
      ngNovelCache: options.useCustomNgNovelFilter && options.saveCustomNgNovel ? novelCache : undefined,
    });
  }, 0);
}

