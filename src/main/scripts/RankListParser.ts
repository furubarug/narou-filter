import {AbstractNovelInfo} from './AbstractNovelInfo';
import {getNcode, getUserId} from './UrlParser';

export function parseRankList(): RankingListNovelInfo[] {
  const novelInfos: RankingListNovelInfo[] = [];
  [...document.body.getElementsByClassName('ranking_list')]
      .forEach((it) => {
        const info = convertToInfoOrNull(it as HTMLElement);
        info && novelInfos.push(info);
      });
  return novelInfos;
}

function convertToInfoOrNull(elm: HTMLElement): RankingListNovelInfo | null {
  const ncode = getNcode(elm);
  const userId = getUserId(elm);

  if (!ncode || !userId) {
    return null;
  }

  const keyword: string[] = [];
  [...elm.getElementsByClassName('keyword')].forEach((item) =>
    [...item.children].forEach((child) => keyword.push(child.innerHTML)),
  );
  return new RankingListNovelInfo(ncode, userId, keyword, elm);
}

class RankingListNovelInfo extends AbstractNovelInfo {
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
