import { connectMySQL } from "../../infrastructure/connection";
import { ApplicationError } from "../error/applicationError";
import { Disc } from "../../domain/model/turn/disc";
import { Point } from "../../domain/model/turn/point";
import { GameResult } from "../../domain/model/gameResult/gameResult";
import { TurnMySQLRepository } from "../../infrastructure/repository/turn/turnMySQLRepository";
import { GameMySQLRepository } from "../../infrastructure/repository/game/gameMySQLRepository";
import { GameResultMySQLRepository } from "../../infrastructure/repository/gameResult/gameResultMySQLRepository";

const turnRepository = new TurnMySQLRepository();
const gameRepository = new GameMySQLRepository();
const gameResultRepository = new GameResultMySQLRepository();

// DTO (Data Transfer Object)
class FindLatestGameTurnByTurnCountOutput {
  constructor(
    public readonly turnCount: number,
    public readonly board: number[][],
    public readonly nextDisc?: number,
    public readonly winnerDisc?: number
  ) {}
}

export class TurnService {
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutput> {
    const conn = await connectMySQL();
    try {
      const game = await gameRepository.findLatest(conn);
      if (!game) {
        throw new ApplicationError(
          "LatestGameNotFount",
          "Latest game not found"
        );
      }
      // ここは予期しないエラーなので通常のエラーを投げる
      if (game.id === undefined) {
        throw new Error("game.id is undefined");
      }

      const turn = await turnRepository.findByGameIdAndTurnCount(
        conn,
        game.id,
        turnCount
      );

      const gameResult = turn.gameEnded()
        ? await gameResultRepository.findByGameId(conn, game.id)
        : undefined;

      // memo: interfaceを使うと何がいけないのだろうか？
      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        // TODO: 決着がついている場合、game_resultsテーブルから取得する
        gameResult?.winnerDisc
      );
    } finally {
      await conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: Disc, point: Point) {
    const conn = await connectMySQL();
    try {
      conn.beginTransaction();

      const game = await gameRepository.findLatest(conn);
      if (!game) {
        throw new ApplicationError(
          "LatestGameNotFount",
          "Latest game not found"
        );
      }
      if (game.id === undefined) {
        throw new Error("game.id is undefined");
      }

      const prevTurnCount = turnCount - 1;
      const prevTurn = await turnRepository.findByGameIdAndTurnCount(
        conn,
        game.id,
        prevTurnCount
      );

      const newTurn = prevTurn.placeNext(disc, point);

      // ターンを保存する
      await turnRepository.save(conn, newTurn);
      // 勝敗が決した場合、対戦結果を保存する
      if (newTurn.gameEnded()) {
        const winnerDisc = newTurn.winnerDisc();
        const gameResult = new GameResult(game.id, winnerDisc, newTurn.endAt);
        await gameResultRepository.save(conn, gameResult);
      }
      conn.commit();
    } finally {
      await conn.end();
    }
  }
}
