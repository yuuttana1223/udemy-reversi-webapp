import express from "express";
import { StartNewGameUseCase } from "../application/useCase/startNewGameUseCase";
import { GameMySQLRepository } from "../infrastructure/repository/game/gameMySQLRepository";
import { TurnMySQLRepository } from "../infrastructure/repository/turn/turnMySQLRepository";

export const gameRouter = express.Router();

const startNewGameUseCase = new StartNewGameUseCase(
  // TODO: infrastructureの依存をなくす
  new GameMySQLRepository(),
  new TurnMySQLRepository()
);

gameRouter.post("/api/games", async (_req, res) => {
  await startNewGameUseCase.run();

  res.status(201).end();
});
