import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

type Game = RowDataPacket & {
  id: number;
  started_at: Date;
};

type Turn = RowDataPacket & {
  id: number;
  turn_count: number;
  next_disc: number;
  end_at: Date | null;
};

type Square = RowDataPacket & {
  x: number;
  y: number;
  disc: number;
};

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
  const conn = await connectMySQL();
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
      row.flatMap((disc, x) => [turnId, x, y, disc])
    );
    await conn.execute(squaresInsertSQL, squaresInsertValues);

    await conn.commit();
  } finally {
    conn.end();
  }

  res.status(201).end();
});

app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = Number(req.params.turnCount);

  const conn = await connectMySQL();
  try {
    const gameSelectResult = await conn.execute<Game[]>(
      "SELECT id, started_at FROM games ORDER BY id DESC LIMIT 1"
    );
    const game = gameSelectResult[0][0];

    const turnSelectResult = await conn.execute<Turn[]>(
      "SELECT id, turn_count, next_disc, end_at FROM turns WHERE game_id = ? AND turn_count = ?",
      [game.id, turnCount]
    );

    const turn = turnSelectResult[0][0];

    const squaresSelectResult = await conn.execute<Square[]>(
      "SELECT x, y, disc FROM squares WHERE turn_id = ?",
      [turn.id]
    );

    const squares = squaresSelectResult[0];
    const board = squares.reduce((acc, square) => {
      acc[square.y][square.x] = square.disc;
      return acc;
    }, INITIAL_BOARD);

    const responseBody = {
      turnCount,
      board,
      nextDisc: turn.next_disc,
      // TODO: 決着がついている場合、game_resultsテーブルから取得する
      winnerDisc: null,
    };
    res.json(responseBody);
  } finally {
    await conn.end();
  }
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

async function connectMySQL() {
  return mysql.createConnection({
    host: "localhost",
    user: "reversi",
    database: "reversi",
    password: "password",
  });
}
