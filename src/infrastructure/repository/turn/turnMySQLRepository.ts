import mysql from "mysql2/promise";
import { TurnGateway } from "../../../infrastructure/turnGateway";
import { MoveGateway } from "../../../infrastructure/moveGateway";
import { SquareGateway } from "../../../infrastructure/squareGateway";
import { INITIAL_BOARD } from "../../../application/constants";
import { Turn } from "../../../domain/model/turn/turn";
import { DomainError } from "../../../domain/error/domainError";
import { toDisc } from "../../../domain/model/turn/disc";
import { Move } from "../../../domain/model/turn/move";
import { Point } from "../../../domain/model/turn/point";
import { Board } from "../../../domain/model/turn/board";
import { TurnRepository } from "../../../domain/model/turn/turnRepository";

const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnMySQLRepository implements TurnRepository {
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
