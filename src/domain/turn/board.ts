import { INITIAL_BOARD } from "../../application/constants";
import { Disc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Board {
  constructor(private _discs: Disc[][]) {}

  get discs(): Disc[][] {
    return this._discs;
  }

  place(move: Move): Board {
    // TODO: 盤面に置けるかチェック
    if (this._discs[move.point.y][move.point.x] !== Disc.Empty) {
      throw new Error(
        `Selected point is not empty. x: ${move.point.x}, y: ${move.point.y}`
      );
    }

    // ひっくり返せる点を列挙
    const flipPoints = this.listFlipPoints();

    // ひっくり返せる点がない場合は置けない
    if (flipPoints.length === 0) {
      throw new Error(
        `Cannot place disc at x: ${move.point.x}, y: ${move.point.y}`
      );
    }

    //
    // 盤面をコピー
    const newDiscs = this._discs.map((row) => {
      return row.map((disc) => {
        return disc;
      });
    });

    newDiscs[move.point.y][move.point.x] = move.disc;

    // 石を置く
    // ひっくり返す

    return new Board(newDiscs);
  }

  private listFlipPoints(): Point[] {
    return [new Point(0, 0)];
  }
}

export const initialBoard = new Board(INITIAL_BOARD);
