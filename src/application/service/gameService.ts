import { connectMySQL } from "../../infrastructure/connection";
import { GameGateway } from "../../infrastructure/gameGateway";
import { Game } from "../../domain/model/game";
import { GameRepository } from "../../domain/game/gameRepository";
import { firstTurn } from "../../domain/model/turn";
import { TurnRepository } from "../../domain/turn/turnRepository";

const gameGateway = new GameGateway();

const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();

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
