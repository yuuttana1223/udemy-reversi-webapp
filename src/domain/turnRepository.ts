import mysql from "mysql2/promise";
import { Turn } from "./turn";
import { GameGateway } from "../dataacesess/gameGateway";
import { TurnGateway } from "../dataacesess/turnGateway";
import { MoveGateway } from "../dataacesess/moveGateway";
import { SquareGateway } from "../dataacesess/squareGateway";
import { toDisc } from "./disc";
import { INITIAL_BOARD } from "../application/constants";
import { Move } from "./move";
import { Point } from "./point";
import { Board } from "./board";

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
      throw new Error(
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

    return new Turn(
      gameId,
      turnCount,
      toDisc(turnRecord.nextDisc),
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
