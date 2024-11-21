import { connectMySQL } from "../dataacesess/connection";
import { GameGateway } from "../dataacesess/gameGateway";
import { MoveGateway } from "../dataacesess/moveGateway";
import { SquareGateway } from "../dataacesess/squareGateway";
import { TurnGateway } from "../dataacesess/turnGateway";
import { toDisc } from "../domain/disc";
import { Point } from "../domain/point";
import { TurnRepository } from "../domain/turnRepository";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const turnRepository = new TurnRepository();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

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
      const gameRecord = await gameGateway.fetchLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const turn = await turnRepository.findByGameIdAndTurnCount(
        conn,
        gameRecord.id,
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

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySQL();
    try {
      conn.beginTransaction();
      const gameRecord = await gameGateway.fetchLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const prevTurnCount = turnCount - 1;
      const prevTurn = await turnRepository.findByGameIdAndTurnCount(
        conn,
        gameRecord.id,
        prevTurnCount
      );

      const newTurn = prevTurn.placeNext(toDisc(disc), new Point(x, y));

      // ターンを保存する
      await turnRepository.save(conn, newTurn);
      conn.commit();
    } finally {
      await conn.end();
    }
  }
}
