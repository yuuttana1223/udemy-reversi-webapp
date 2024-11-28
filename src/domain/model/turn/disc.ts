import { DomainError } from "../../error/domainError";

// memo: classのほうがいいのか？
export const Disc = {
  Empty: 0,
  Dark: 1,
  Light: 2,
  Wall: 3, // 番兵 壁で囲っている数値
} as const;

export type Disc = (typeof Disc)[keyof typeof Disc];

export function toDisc(value: number): Disc {
  switch (value) {
    case Disc.Empty:
      return Disc.Empty;
    case Disc.Dark:
      return Disc.Dark;
    case Disc.Light:
      return Disc.Light;
    case Disc.Wall:
      return Disc.Wall;
    default:
      throw new DomainError("InvalidDiscValue", `Invalid disc value: ${value}`);
  }
}

export function isOppositeDisc(disc1: Disc, disc2: Disc): boolean {
  return (
    (disc1 === Disc.Dark && disc2 === Disc.Light) ||
    (disc1 === Disc.Light && disc2 === Disc.Dark)
  );
}
