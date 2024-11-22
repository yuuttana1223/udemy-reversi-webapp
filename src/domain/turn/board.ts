import { INITIAL_BOARD } from "../../application/constants";
import { Disc } from "./disc";
import { Move } from "./move";

export class Board {
  constructor(private _discs: Disc[][]) {}

  get discs(): Disc[][] {
    return this._discs;
  }

  place(move: Move): Board {
    // TODO: 盤面に置けるかチェック
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
}

export const initialBoard = new Board(INITIAL_BOARD);
