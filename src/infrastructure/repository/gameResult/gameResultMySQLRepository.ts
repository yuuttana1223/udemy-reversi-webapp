import mysql from "mysql2/promise";
import { GameResultGateway } from "./gameResultGateway";
import { GameResult } from "../../../domain/model/gameResult/gameResult";
import { toWinnerDisc } from "../../../domain/model/gameResult/winnerDisc";
import { GameResultRepository } from "../../../domain/model/gameResult/gameResultRepository";

const gameResultGateway = new GameResultGateway();

export class GameResultMySQLRepository implements GameResultRepository {
  async findByGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResult | undefined> {
    const gameResultRecord = await gameResultGateway.findByGameId(conn, gameId);

    if (!gameResultRecord) {
      return;
    }

    return new GameResult(
      gameResultRecord.gameId,
      toWinnerDisc(gameResultRecord.winnerDisc),
      gameResultRecord.endAt
    );
  }

  async save(conn: mysql.Connection, gameResult: GameResult) {
    await gameResultGateway.insert(
      conn,
      gameResult.gameId,
      gameResult.winnerDisc,
      gameResult.endAt
    );
  }
}
