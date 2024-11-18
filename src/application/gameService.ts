import { connectMySQL } from "../dataacesess/connection";
import { GameGateway } from "../dataacesess/gameGateway";
import { SquareGateway } from "../dataacesess/squareGateway";
import { TurnGateway } from "../dataacesess/turnGateway";
import { DARK, INITIAL_BOARD } from "./constants";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySQL();
    try {
      await conn.beginTransaction();

      const gameRecord = await gameGateway.insert(conn, now);

      const turnRecord = await turnGateway.insert(
        conn,
        gameRecord.id,
        0,
        DARK,
        now
      );

      await squareGateway.insertAll(conn, turnRecord.id, INITIAL_BOARD);

      await conn.commit();
    } finally {
      conn.end();
    }
  }
}
