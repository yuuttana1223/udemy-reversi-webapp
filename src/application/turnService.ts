import { connectMySQL } from "../dataacesess/connection";
import { GameGateway } from "../dataacesess/gameGateway";
import { MoveGateway } from "../dataacesess/moveGateway";
import { SquareGateway } from "../dataacesess/squareGateway";
import { TurnGateway } from "../dataacesess/turnGateway";
import { DARK, INITIAL_BOARD, LIGHT } from "./constants";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnService {
  async findLatestGameTurnByTurnCount(turnCount: number) {
    const conn = await connectMySQL();
    try {
      const gameRecord = await gameGateway.fetchLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const turnRecord = await turnGateway.findByGameIdAndTurnCount(
        conn,
        gameRecord.id,
        turnCount
      );

      if (!turnRecord) {
        throw new Error(
          `Turn not fount. game_id: ${gameRecord.id}, turn_count: ${turnCount}`
        );
      }

      const squareRecords = await squareGateway.findByTurnId(
        conn,
        turnRecord.id
      );
      const board = squareRecords.reduce((acc, square) => {
        acc[square.y][square.x] = square.disc;
        return acc;
      }, INITIAL_BOARD);

      return {
        turnCount,
        board,
        nextDisc: turnRecord.nextDisc,
        // TODO: 決着がついている場合、game_resultsテーブルから取得する
        winnerDisc: null,
      };
    } finally {
      await conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySQL();
    try {
      const gameRecord = await gameGateway.fetchLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const prevTurnCount = turnCount - 1;

      const prevTurnRecord = await turnGateway.findByGameIdAndTurnCount(
        conn,
        gameRecord.id,
        prevTurnCount
      );

      if (!prevTurnRecord) {
        throw new Error(
          `Turn not fount. game_id: ${gameRecord.id}, turn_count: ${prevTurnCount}`
        );
      }

      const squareRecords = await squareGateway.findByTurnId(
        conn,
        prevTurnRecord.id
      );

      const board = squareRecords.reduce((acc, square) => {
        acc[square.y][square.x] = square.disc;
        return acc;
      }, INITIAL_BOARD);

      // 盤面におけるかチェック
      // 石を置く
      board[y][x] = disc;
      // ひっくり返す
      // ターンを保存する
      const now = new Date();
      const nextDisc = disc === DARK ? LIGHT : DARK;

      const turnRecord = await turnGateway.insert(
        conn,
        gameRecord.id,
        turnCount,
        nextDisc,
        now
      );

      await squareGateway.insertAll(conn, turnRecord.id, board);
      await moveGateway.insert(conn, turnRecord.id, disc, x, y);
    } finally {
      await conn.end();
    }
  }
}
