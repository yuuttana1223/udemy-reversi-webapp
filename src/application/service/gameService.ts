import { connectMySQL } from "../../infrastructure/connection";
import { Game } from "../../domain/model/game/game";
import { firstTurn } from "../../domain/model/turn/turn";
import { TurnMySQLRepository } from "../../infrastructure/repository/turn/turnMySQLRepository";
import { GameMySQLRepository } from "../../infrastructure/repository/game/gameMySQLRepository";

const turnRepository = new TurnMySQLRepository();
const gameRepository = new GameMySQLRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySQL();
    try {
      await conn.beginTransaction();

      const game = await gameRepository.save(conn, new Game(undefined, now));
      if (game.id === undefined) {
        throw new Error("game.id is undefined");
      }

      const turn = firstTurn(game.id, now);

      await turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      conn.end();
    }
  }
}
