import { connectMySQL } from "../dataacesess/connection";
import { GameGateway } from "../dataacesess/gameGateway";
import { firstTurn, Turn } from "../domain/turn";
import { TurnRepository } from "../domain/turnRepository";

const gameGateway = new GameGateway();

const turnRepository = new TurnRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySQL();
    try {
      await conn.beginTransaction();

      const gameRecord = await gameGateway.insert(conn, now);

      const turn = firstTurn(gameRecord.id, now);

      await turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      conn.end();
    }
  }
}
