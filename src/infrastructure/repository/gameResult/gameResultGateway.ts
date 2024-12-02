import mysql, { RowDataPacket } from "mysql2/promise";
import { GameResultRecord } from "./gameResultRecord";

type GameResult = RowDataPacket & {
  id: GameResultRecord["_id"];
  game_id: GameResultRecord["_gameId"];
  winner_disc: GameResultRecord["_winnerDisc"];
  end_at: GameResultRecord["_endAt"];
};

export class GameResultGateway {
  async findByGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResultRecord | undefined> {
    const gameSelectResult = await conn.execute<GameResult[]>(
      "SELECT id, game_id, winner_disc, end_at FROM game_results WHERE game_id = ?",
      [gameId]
    );
    const record = gameSelectResult[0][0];

    if (!record) {
      return;
    }
    return new GameResultRecord(
      record.id,
      record.game_id,
      record.winner_disc,
      record.end_at
    );
  }

  async insert(
    conn: mysql.Connection,
    gameId: number,
    winnerDisc: number,
    endAt: Date
  ) {
    await conn.execute(
      "INSERT INTO game_results (game_id, winner_disc, end_at) VALUES (?, ?, ?)",
      [gameId, winnerDisc, endAt]
    );
  }
}
