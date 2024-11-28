import { DomainError } from "../error/domainError";
import { Board, initialBoard } from "../turn/board";
import { Disc } from "../turn/disc";
import { Move } from "../turn/move";
import { Point } from "../turn/point";

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc | undefined,
    private _move: Move | undefined, // コンストラクターで?はできない
    private _board: Board,
    private _endAt: Date
  ) {}

  get gameId(): number {
    return this._gameId;
  }

  get turnCount(): number {
    return this._turnCount;
  }

  get nextDisc(): Disc | undefined {
    return this._nextDisc;
  }

  get move(): Move | undefined {
    return this._move;
  }

  get endAt(): Date {
    return this._endAt;
  }

  get board(): Board {
    return this._board;
  }

  placeNext(disc: Disc, point: Point): Turn {
    // 打とうとした石が、次の石ではない場合、置くことができない
    if (disc !== this._nextDisc) {
      throw new DomainError(
        "SelectedDiscIsNotNextDisc",
        `It's not your turn. disc: ${disc}, nextDisc: ${this._nextDisc}`
      );
    }
    const move = new Move(disc, point);

    const nextBoard = this._board.place(move);

    const nextDisc = this.decideNextDisc(nextBoard, disc);

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      move,
      nextBoard,
      new Date()
    );
  }

  private decideNextDisc(board: Board, prevDisc: Disc): Disc | undefined {
    const canDarkMove = board.existsValidMove(Disc.Dark);
    const canLightMove = board.existsValidMove(Disc.Light);

    if (canDarkMove && canLightMove) {
      return prevDisc === Disc.Dark ? Disc.Light : Disc.Dark;
    }
    if (!canDarkMove && !canLightMove) {
      return undefined;
    }
    return canDarkMove ? Disc.Dark : Disc.Light;
  }
}

export function firstTurn(gameId: number, endAt: Date): Turn {
  return new Turn(gameId, 0, Disc.Dark, undefined, initialBoard, endAt);
}
