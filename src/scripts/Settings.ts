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
  userCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customNgUser: string;
  customFilter: string;
}

export interface ParsedOptions {
  ngUser: string[],
  ngCode: string[],
  ngKeyword: string[],
  userCustomFilter: boolean;
  saveCustomNgUser: boolean;
  customNgUser: string[];
  customFilter: string;
}

const delimiter = /[\s,.|:;]+/;

/* eslint-disable max-len */
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
  userCustomFilter: false,
  saveCustomNgUser: true,
  customNgUser: '',
  customFilter: defaultFilter,
};

function parse(str: string): string[] {
  return str.split(delimiter);
}

export namespace Settings {
  export function save(options: Options): void {
    browser.storage.sync.set(options);
  }

  export function load(): Promise<Options> {
    return browser.storage.sync.get(defaultOptions);
  }

  export function saveNgUsers(ngUsers: string[]): void {
    const customNgUser = ngUsers.join(' ');
    load().then((options) => save({...options, customNgUser}), console.error);
  }

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      userCustomFilter: options.userCustomFilter,
      saveCustomNgUser: options.saveCustomNgUser,
      customNgUser: parse(options.customNgUser),
      customFilter: options.customFilter,
    };
  }

  export function getDefault(): Options {
    return defaultOptions;
  }
}
