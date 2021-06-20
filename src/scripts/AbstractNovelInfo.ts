export abstract class AbstractNovelInfo {
  abstract enable(): void;

  abstract disable(): void;

  abstract readonly ncode: string;

  abstract readonly userId: string;

  abstract readonly keyword: string[] | undefined;
}
