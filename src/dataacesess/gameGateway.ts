import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { GameRecord } from "./gameRecord";

type Game = RowDataPacket & {
  id: GameRecord["_id"];
  started_at: GameRecord["_started_at"];
};

export class GameGateway {
  async fetchLatest(conn: mysql.Connection): Promise<GameRecord | undefined> {
    const gameSelectResult = await conn.execute<Game[]>(
      "SELECT id, started_at FROM games ORDER BY id DESC LIMIT 1"
    );
    const record = gameSelectResult[0][0];

    if (!record) {
      return;
    }
    return new GameRecord(record.id, record.started_at);
  }

  async insert(conn: mysql.Connection, startedAt: Date): Promise<GameRecord> {
    const gameInsertResult = await conn.execute<ResultSetHeader>(
      "INSERT INTO games (started_at) VALUES (?)",
      [startedAt]
    );
    const gameId = gameInsertResult[0].insertId;

    return new GameRecord(gameId, startedAt);
  }
}
