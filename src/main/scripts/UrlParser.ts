const ncodeReg = /https:\/\/ncode.syosetu.com\/([^/]*)\//m;
const userIdReg = /https:\/\/mypage.syosetu.com\/(\d*)\//m;
const keywordReg = /<a.*\/search\.php\?word=[^>]*>([^<]*)<\/a>/m;

export function getNcode(elm: HTMLElement): string | null {
  const ncode = elm.outerHTML.match(ncodeReg);
  return ncode ? ncode[1] : null;
}

export function getUserId(elm: HTMLElement): string | null {
  const userId = elm.outerHTML.match(userIdReg);
  return userId ? userId[1] : null;
}

export function getKeyword(elm: HTMLAnchorElement): string | null {
  const keyword = elm.outerHTML.match(keywordReg);
  return keyword ? keyword[1] : null;
}
