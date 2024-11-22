import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { SquareRecord } from "./squareRecord";

type Square = RowDataPacket & {
  id: SquareRecord["_id"];
  turnId: SquareRecord["_turnId"];
  x: SquareRecord["_x"];
  y: SquareRecord["_y"];
  disc: SquareRecord["_disc"];
};

export class SquareGateway {
  async findByTurnId(
    conn: mysql.Connection,
    turnId: number
  ): Promise<SquareRecord[]> {
    const squaresSelectResult = await conn.execute<Square[]>(
      "SELECT id, turn_id, x, y, disc FROM squares WHERE turn_id = ?",
      [turnId]
    );

    const records = squaresSelectResult[0];
    return records.map(
      (r) => new SquareRecord(r.id, r.turnId, r.x, r.y, r.disc)
    );
  }
  // memo: squareなのにboardをinsertするのはおかしいがいったんこのままにしておく
  async insertAll(
    conn: mysql.Connection,
    turnId: number,
    board: number[][]
  ): Promise<void> {
    const squareCount = board.flat().length;
    const squaresInsertSQL = `INSERT INTO squares (turn_id, x, y, disc) VALUES ${Array(
      squareCount
    )
      .fill("(?, ?, ?, ?)")
      .join(", ")}`;
    const squaresInsertValues = board.flatMap((row, y) =>
      row.flatMap((disc, x) => [turnId, x, y, disc])
    );
    await conn.execute(squaresInsertSQL, squaresInsertValues);
  }
}
