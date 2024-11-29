import mysql from "mysql2/promise";
import { GameResult } from "./gameResult";
import { GameResultGateway } from "../../../infrastructure/gameResultGateway";
import { toWinnerDisc } from "./winnerDisc";

const gameResultGateway = new GameResultGateway();

export class GameResultRepository {
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
