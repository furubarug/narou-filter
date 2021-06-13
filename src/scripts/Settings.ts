declare const browser: {
  storage: {
    sync: {
      set: (op: Options) => any,
      get: (key: Options) => Promise<Options>
    }
  }
};

interface Options {
  ngUser: string,
  ngCode: string,
  ngKeyword: string,
  userCustomFilter: boolean;
  customFilter: string;
}

interface ParsedOptions {
  ngUser: string[],
  ngCode: string[],
  ngKeyword: string[],
  userCustomFilter: boolean;
  customFilter: string;
}

const defaultOptions: Options = {
  ngUser: '',
  ngCode: '',
  ngKeyword: '',
  userCustomFilter: false,
  customFilter: '',
};

const delimiter = /[\s,.|:;]+/;

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

  export async function loadParsed(): Promise<ParsedOptions> {
    const options = await load();
    return {
      ngUser: parse(options.ngUser),
      ngCode: parse(options.ngCode),
      ngKeyword: parse(options.ngKeyword),
      userCustomFilter: options.userCustomFilter,
      customFilter: options.customFilter,
    };
  }
}
