import mysql from "mysql2/promise";
import { Game } from "./game";
import { GameGateway } from "../../dataacesess/gameGateway";

const gameGateway = new GameGateway();

export class GameRepository {
  async findLatest(conn: mysql.Connection): Promise<Game | undefined> {
    const gameRecord = await gameGateway.fetchLatest(conn);
    if (!gameRecord) {
      return undefined;
    }

    return new Game(gameRecord.id, gameRecord.startedAt);
  }

  async save(conn: mysql.Connection, game: Game): Promise<Game> {
    const gameRecord = await gameGateway.insert(conn, game.startedAt);

    return new Game(gameRecord.id, gameRecord.startedAt);
  }
}
