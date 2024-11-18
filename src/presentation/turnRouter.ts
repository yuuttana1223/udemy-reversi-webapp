import express from "express";
import { TurnService } from "../application/turnService";

export const turnRouter = express.Router();

const turnService = new TurnService();

turnRouter.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);
  const t = await turnService.findLatestGameTurnByTurnCount(turnCount);
  res.json(t);
});

turnRouter.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);
  await turnService.registerTurn(turnCount, disc, x, y);
  // 1つ前のターンを取得
  res.status(201).end();
});
