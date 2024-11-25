import { INITIAL_BOARD } from "../../application/constants";
import { Disc, isOppositeDisc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Board {
  private _walledDiscs: Disc[][];

  constructor(private _discs: Disc[][]) {
    this._walledDiscs = this.wallDiscs();
  }

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
    const flipPoints = this.listFlipPoints(move);

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

  private listFlipPoints(move: Move): Point[] {
    const flipPoints: Point[] = [];

    const walledX = move.point.x + 1;
    const walledY = move.point.y + 1;

    const checkFlipPoints = (xMove: number, yMove: number) => {
      const flipCandidate: Point[] = [];

      let cursorX = walledX + xMove;
      let cursorY = walledY + yMove;

      while (isOppositeDisc(move.disc, this._walledDiscs[cursorY][cursorX])) {
        // 番兵を考慮して-1する
        flipCandidate.push(new Point(cursorX - 1, cursorY - 1));
        cursorX += xMove;
        cursorY += yMove;
        // 次の手が同じ色の石なら、ひっくり返せる石が確定
        if (move.disc === this._walledDiscs[cursorY][cursorX]) {
          flipPoints.push(...flipCandidate);
          break;
        }
      }
    };

    checkFlipPoints(0, -1); // 上
    checkFlipPoints(-1, -1); // 左上
    checkFlipPoints(-1, 0); // 左
    checkFlipPoints(-1, 1); // 左下
    checkFlipPoints(0, 1); // 下
    checkFlipPoints(1, 1); // 右下
    checkFlipPoints(1, 0); // 右
    checkFlipPoints(1, -1); // 右上

    return flipPoints;
  }

  private wallDiscs(): Disc[][] {
    const walledDiscs: Disc[][] = [];
    const topAndBottomWall = Array(this._discs[0].length + 2).fill(Disc.Wall);
    walledDiscs.push(topAndBottomWall);

    this._discs.forEach((row) => {
      const walledLine = [Disc.Wall, ...row, Disc.Wall];
      walledDiscs.push(walledLine);
    });

    walledDiscs.push(topAndBottomWall);

    return walledDiscs;
  }
}

export const initialBoard = new Board(INITIAL_BOARD);
