import express from "express";
import { StartNewGameUseCase } from "../application/useCase/startNewGameUseCase";
import { GameMySQLRepository } from "../infrastructure/repository/game/gameMySQLRepository";
import { TurnMySQLRepository } from "../infrastructure/repository/turn/turnMySQLRepository";
import { FindLastGamesMySQLQueryService } from "../infrastructure/query/findLastGamesMySQLQueryService";
import { FindLastGamesUseCase } from "../application/useCase/findLastGamesUseCase";

export const gameRouter = express.Router();

const startNewGameUseCase = new StartNewGameUseCase(
  // TODO: infrastructureの依存をなくす
  new GameMySQLRepository(),
  new TurnMySQLRepository()
);

const findLastGamesUseCase = new FindLastGamesUseCase(
  new FindLastGamesMySQLQueryService()
);

interface GatGamesResponseBody {
  games: {
    id: number;
    darkMoveCount: number;
    lightMoveCount: number;
    winnerDisc: number;
    startedAt: Date;
    endAt: Date;
  }[];
}

gameRouter.get(
  "/api/games",
  async (req, res: express.Response<GatGamesResponseBody>) => {
    const output = await findLastGamesUseCase.run();
    const responseBodyGames = output.map((g) => {
      return {
        id: g.gameId,
        darkMoveCount: g.darkMoveCount,
        lightMoveCount: g.lightMoveCount,
        winnerDisc: g.winnerDisc,
        startedAt: g.startedAt,
        endAt: g.endAt,
      };
    });
    const responseBody: GatGamesResponseBody = {
      games: responseBodyGames,
    };

    res.json(responseBody);
  }
);

gameRouter.post("/api/games", async (_req, res) => {
  await startNewGameUseCase.run();

  res.status(201).end();
});
