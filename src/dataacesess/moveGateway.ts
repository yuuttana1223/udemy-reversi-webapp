import mysql, { RowDataPacket } from "mysql2/promise";
import { MoveRecord } from "./moveRecord";

type Move = RowDataPacket & {
  id: MoveRecord["_id"];
  disc: MoveRecord["_disc"];
  x: MoveRecord["_x"];
  y: MoveRecord["_y"];
};

export class MoveGateway {
  async findByTurnId(
    conn: mysql.Connection,
    turnId: number
  ): Promise<MoveRecord | undefined> {
    const moveSelectResult = await conn.execute<Move[]>(
      "SELECT disc, x, y FROM moves WHERE turn_id = ?",
      [turnId]
    );
    const record = moveSelectResult[0][0];

    if (!record) {
      return;
    }

    return new MoveRecord(record.id, turnId, record.disc, record.x, record.y);
  }

  async insert(
    conn: mysql.Connection,
    turnId: number,
    disc: number,
    x: number,
    y: number
  ): Promise<void> {
    await conn.execute(
      "INSERT INTO moves (turn_id, disc, x, y) VALUES (?, ?, ?, ?)",
      [turnId, disc, x, y]
    );
  }
}
