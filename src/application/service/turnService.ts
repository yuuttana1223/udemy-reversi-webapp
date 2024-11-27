import { connectMySQL } from "../../infrastructure/connection";
import { GameRepository } from "../../domain/game/gameRepository";
import { Disc, toDisc } from "../../domain/turn/disc";
import { Point } from "../../domain/turn/point";
import { TurnRepository } from "../../domain/turn/turnRepository";
import { ApplicationError } from "../error/applicationError";

const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();

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

      // memo: interfaceを使うと何がいけないのだろうか？
      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        // TODO: 決着がついている場合、game_resultsテーブルから取得する
        undefined
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
      conn.commit();
    } finally {
      await conn.end();
    }
  }
}
