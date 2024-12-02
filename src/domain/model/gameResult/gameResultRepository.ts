import mysql from "mysql2/promise";
import { GameResult } from "./gameResult";
export interface GameResultRepository {
  findByGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResult | undefined>;
  save(conn: mysql.Connection, gameResult: GameResult): Promise<void>;
}
