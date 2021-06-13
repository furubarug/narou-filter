import {Settings} from './Settings';
import {AbstractNovelInfo} from './AbstractNovelInfo';

type Target = AbstractNovelInfo & { keyword?: string[] };

const customTargets: Target[] = [];
let connecting = false;

export function applyFilter(target: Target[]): void {
  customTargets.splice(0);
  Settings.loadParsed().then((options) => {
    target.forEach((it) => {
      if (
        options.ngCode.includes(it.ncode) ||
        options.ngUser.includes(it.userId) ||
        it.keyword?.some((word) => options.ngKeyword.includes(word))
      ) {
        it.disable();
      } else if (options.userCustomFilter) {
        applyCustomFilter(it, options.customFilter);
      }
    });
  }, console.error);
}

function applyCustomFilter(target: Target, fun: string): void {
  target.disable();
  customTargets.push(target);
  if (connecting) {
    return;
  }
  connecting = true;
  setTimeout(async () => {
    let t = customTargets.pop();
    while (t) {
      const ret = await custom(t.userId, t.ncode, fun);
      ret || t.enable();
      await sleep(200);
      t = customTargets.pop();
    }
    connecting = false;
  }, 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Filter = (userId: string, ncode: string) => Promise<any>;

async function custom(userId: string, ncode: string, fun: string)
  : Promise<boolean> {
  try {
    // noinspection JSUnusedLocalSymbols
    const filter: Filter = eval('async (userId, ncode) => {' + fun + '}');
    return await filter(userId, ncode) === true;
  } catch (e) {
    console.error(e);
    return true;
  }
}
