import {AbstractNovelInfo} from './AbstractNovelInfo';
import {getNcode, getUserId} from './UrlParser';

export function parseRankTop(): RankingTopNovelInfo[] {
  const novelInfos: RankingTopNovelInfo[] = [];
  [...document.body.getElementsByTagName('li')].forEach((item) => {
    const info = convertToInfoOrNull(item);
    info && novelInfos.push(info);
  });
  return novelInfos;
}

function convertToInfoOrNull(elm: HTMLElement): RankingTopNovelInfo | null {
  const ncode = getNcode(elm);
  const userId = getUserId(elm);
  return ncode && userId ? new RankingTopNovelInfo(ncode, userId, elm) : null;
}

class RankingTopNovelInfo extends AbstractNovelInfo {
  constructor(
    readonly ncode: string,
    readonly userId: string,
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
