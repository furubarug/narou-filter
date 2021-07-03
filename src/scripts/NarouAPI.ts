export type ApiNovelInfo = {
  title: string,
  ncode: string,
  userid: number,
  writer: string,
  story: string,
  biggenre: 1 | 2 | 3 | 4 | 99 | 98, // 1: 恋愛 2: ファンタジー 3: 文芸 4: SF 99: その他 98: ノンジャンル
  genre: 101 | 102 | 201 | 202 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 401 | 402 | 403 | 404 |
    9901 | 9902 | 9903 | 9904 | 9999 | 9801,
  keyword: string,
  ['general_firstup']: string,
  ['general_firstup']: string,
  ['novel_type']: 1 | 2, // 連載1, 短編2
  end: 0 | 1, // 短編小説・完結済小説0, 連載中1
  ['general_all_no']: number,
  length: number,
  isstop: 0 | 1, // 長期連載停止中1, それ以外0
  ['fav_novel_cnt']: number, // ブックマーク数
  ['impression_cnt']: number, // 感想数
  ['review_cnt']: number, // レビュー数
  ['all_point']: number, // 評価ポイント
  ['all_hyoka_cnt']: number, // 評価者数
  ['novelupdated_at']: string,
};
type NarouAPI = [{ allcount: number }, ...ApiNovelInfo[]];

export async function getNovelInfoByUserId(userId: string): Promise<NarouAPI> {
  const url = `https://api.syosetu.com/novelapi/api/?out=json&libtype=2&userid=${userId}`;
  const res = await fetch(url);
  return await res.json();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
