import mysql from "mysql2/promise";
import { Turn } from "../model/turn";
import { toDisc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";
import { Board } from "./board";
import { TurnGateway } from "../../infrastructure/turnGateway";
import { MoveGateway } from "../../infrastructure/moveGateway";
import { SquareGateway } from "../../infrastructure/squareGateway";
import { INITIAL_BOARD } from "../../application/constants";
import { DomainError } from "../error/domainError";

const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnRepository {
  async findByGameIdAndTurnCount(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<Turn> {
    const turnRecord = await turnGateway.findByGameIdAndTurnCount(
      conn,
      gameId,
      turnCount
    );

    if (!turnRecord) {
      throw new DomainError(
        "SpecifiedTurnNotFount",
        `Turn not fount. game_id: ${gameId}, turn_count: ${turnCount}`
      );
    }

    const squareRecords = await squareGateway.findByTurnId(conn, turnRecord.id);
    const board = squareRecords.reduce((acc, square) => {
      acc[square.y][square.x] = toDisc(square.disc);
      return acc;
    }, INITIAL_BOARD);

    const moveRecord = await moveGateway.findByTurnId(conn, turnRecord.id);

    const move =
      moveRecord &&
      new Move(toDisc(moveRecord.disc), new Point(moveRecord.x, moveRecord.y));

    const nextDisc = turnRecord.nextDisc
      ? toDisc(turnRecord.nextDisc)
      : undefined;

    return new Turn(
      gameId,
      turnCount,
      nextDisc,
      move,
      new Board(board),
      turnRecord.endAt
    );
  }

  async save(conn: mysql.Connection, turn: Turn) {
    const turnRecord = await turnGateway.insert(
      conn,
      turn.gameId,
      turn.turnCount,
      turn.nextDisc,
      turn.endAt
    );

    await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs);

    if (turn.move) {
      await moveGateway.insert(
        conn,
        turnRecord.id,
        turn.move.disc,
        turn.move.point.x,
        turn.move.point.y
      );
    }
  }
}
