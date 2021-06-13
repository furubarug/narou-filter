import {ParsedOptions, Settings} from './Settings';
import {AbstractNovelInfo} from './AbstractNovelInfo';

type Target = AbstractNovelInfo & { keyword?: string[] };

const customTargets: Target[] = [];
const customNgUser: string[] = [];
let customIndex = 0;
let connecting = false;

export function applyFilter(target: Target[]): void {
  customTargets.splice(0);
  customNgUser.splice(0);
  customIndex = 0;
  Settings.loadParsed().then((options) => {
    customNgUser.push(...options.customNgUser);
    target.forEach((it) => {
      if (
        options.ngCode.includes(it.ncode) ||
        options.ngUser.includes(it.userId) ||
        it.keyword?.some((word) => options.ngKeyword.includes(word))
      ) {
        it.disable();
      } else if (options.userCustomFilter) {
        applyCustomFilter(it, options);
      }
    });
  }, console.error);
}

function applyCustomFilter(target: Target, options: ParsedOptions): void {
  target.disable();
  customTargets.push(target);
  if (connecting) {
    return;
  }
  connecting = true;
  setTimeout(async () => {
    while (customIndex < customTargets.length) {
      const t = customTargets[customIndex++];
      if (customNgUser.includes(t.userId)) {
        continue;
      }
      if (await custom(t.userId, t.ncode, options.customFilter)) {
        customNgUser.push(t.userId);
      } else {
        t.enable();
      }
      await sleep(200);
    }
    connecting = false;
    if (options.userCustomFilter && options.saveCustomNgUser) {
      Settings.saveNgUsers(customNgUser);
    }
  }, 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Filter = (userId: string, ncode: string) => Promise<any>;
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

async function custom(userId: string, ncode: string, fun: string)
  : Promise<boolean> {
  try {
    const filter: Filter = new AsyncFunction('userId', 'ncode', fun);
    return await filter(userId, ncode) === true;
  } catch (e) {
    console.error(e);
    return true;
  }
}
