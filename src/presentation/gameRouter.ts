import express from "express";
import { GameGateway } from "../dataacesess/gameGateway";
import { TurnGateway } from "../dataacesess/turnGateway";
import { SquareGateway } from "../dataacesess/squareGateway";
import { connectMySQL } from "../dataacesess/connection";
import { DARK, INITIAL_BOARD } from "../application/constants";

export const gameRouter = express.Router();
const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();

gameRouter.post("/api/games", async (req, res) => {
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

  res.status(201).end();
});
