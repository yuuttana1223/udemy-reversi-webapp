import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql, { ResultSetHeader } from "mysql2/promise";

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const INITIAL_BOARD = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const PORT = 3000;
const app = express();

app.use(morgan("dev"));
app.use(express.static("static", { extensions: ["html"] }));

app.get("/api/hello", async (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/api/error", async (req, res) => {
  throw new Error("error endpoint");
});

app.post("/api/games", async (req, res) => {
  const now = new Date();
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "reversi",
    database: "reversi",
    password: "password",
  });

  try {
    await conn.beginTransaction();

    const gameInsertResult = await conn.execute<ResultSetHeader>(
      "INSERT INTO games (started_at) VALUES (?)",
      [now]
    );
    const gameId = gameInsertResult[0].insertId;

    const turnInsertResult = await conn.execute<ResultSetHeader>(
      "INSERT INTO turns (game_id, turn_count, next_disc, end_at) VALUES (?, ?, ?, ?)",
      [gameId, 0, DARK, now]
    );
    const turnId = turnInsertResult[0].insertId;

    const squareCount = INITIAL_BOARD.flat().length;
    const squaresInsertSQL = `INSERT INTO squares (turn_id, x, y, disc) VALUES ${Array(
      squareCount
    )
      .fill("(?, ?, ?, ?)")
      .join(", ")}`;
    const squaresInsertValues = INITIAL_BOARD.flatMap((row, y) =>
      row.map((disc, x) => [turnId, x, y, disc])
    ).flat();
    await conn.execute(squaresInsertSQL, squaresInsertValues);

    await conn.commit();
  } finally {
    conn.end();
  }

  res.status(201).end();
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function errorHandler(
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  console.error("Unexpected error occurred", err);
  res.status(500).send({ message: "Unexpected error occurred" });
}
