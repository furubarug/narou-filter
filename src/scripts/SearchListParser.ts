import {AbstractNovelInfo} from './AbstractNovelInfo';
import {getKeyword, getNcode, getUserId} from './UrlParser';

export function parseSearchList(): SearchListNovelInfo[] {
  const novelInfos: SearchListNovelInfo[] = [];
  [...document.body.getElementsByClassName('searchkekka_box')].forEach((it) => {
    const info = convertToInfoOrNull(it as HTMLElement);
    info && novelInfos.push(info);
  });
  return novelInfos;
}

function convertToInfoOrNull(elm: HTMLElement): SearchListNovelInfo | null {
  const ncode = getNcode(elm);
  const userId = getUserId(elm);

  if (!ncode || !userId) {
    return null;
  }

  const keyword: string[] = [];
  [...elm.getElementsByTagName('a')].forEach((anchor) => {
    const word = getKeyword(anchor);
    word && keyword.push(word);
  });

  return new SearchListNovelInfo(ncode, userId, keyword, elm);
}

class SearchListNovelInfo extends AbstractNovelInfo {
  constructor(
    readonly ncode: string,
    readonly userId: string,
    readonly keyword: string[],
    private readonly elm: HTMLElement,
  ) {
    super();
  }

  disable(): void {
    this.elm.style.display = 'none';
  }

  enable(): void {
    this.elm.style.display = '';
  }
}
