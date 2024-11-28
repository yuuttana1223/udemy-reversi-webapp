import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { TurnRecord } from "./turnRecord";

type Turn = RowDataPacket & {
  id: TurnRecord["_id"];
  game_id: TurnRecord["_gameId"];
  turn_count: TurnRecord["_turnCount"];
  next_disc: TurnRecord["_nextDisc"];
  end_at: TurnRecord["_endAt"];
};

export class TurnGateway {
  async findByGameIdAndTurnCount(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<TurnRecord | undefined> {
    const turnSelectResult = await conn.execute<Turn[]>(
      "SELECT id, turn_count, next_disc, end_at FROM turns WHERE game_id = ? AND turn_count = ?",
      [gameId, turnCount]
    );

    const record = turnSelectResult[0][0];

    if (!record) {
      return;
    }

    return new TurnRecord(
      record.id,
      record.game_id,
      record.turn_count,
      record.next_disc,
      record.end_at
    );
  }

  async insert(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number,
    nextDisc: number | undefined,
    endAt: Date
  ): Promise<TurnRecord> {
    const turnInsertResult = await conn.execute<ResultSetHeader>(
      "INSERT INTO turns (game_id, turn_count, next_disc, end_at) VALUES (?, ?, ?, ?)",
      [gameId, turnCount, nextDisc ?? null, endAt]
    );
    const turnId = turnInsertResult[0].insertId;
    return new TurnRecord(turnId, gameId, turnCount, nextDisc, endAt);
  }
}
