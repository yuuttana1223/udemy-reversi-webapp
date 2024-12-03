import express from "express";
import { toDisc } from "../domain/model/turn/disc";
import { Point } from "../domain/model/turn/point";
import { TurnMySQLRepository } from "../infrastructure/repository/turn/turnMySQLRepository";
import { GameMySQLRepository } from "../infrastructure/repository/game/gameMySQLRepository";
import { GameResultMySQLRepository } from "../infrastructure/repository/gameResult/gameResultMySQLRepository";
import { ResisterTurnUseCase } from "../application/useCase/registerTurnUseCase";
import { FindLatestGameTurnByTurnCountUseCase } from "../application/useCase/findLatestGameTurnByTurnCountUseCase";

export const turnRouter = express.Router();

const findLatestGameTurnByTurnCountUseCase =
  new FindLatestGameTurnByTurnCountUseCase(
    new TurnMySQLRepository(),
    new GameMySQLRepository(),
    new GameResultMySQLRepository()
  );

const registerTurnUseCase = new ResisterTurnUseCase(
  // TODO: infrastructureの依存をなくす
  new TurnMySQLRepository(),
  new GameMySQLRepository(),
  new GameResultMySQLRepository()
);

// これを定義することで、Serviceを変更してもレスポンスに影響がない
interface TurnGetResponseBody {
  turnCount: number;
  board: number[][];
  nextDisc: number | null;
  winnerDisc: number | null;
}

turnRouter.get(
  "/api/games/latest/turns/:turnCount",
  async (req, res: express.Response<TurnGetResponseBody>) => {
    const turnCount = parseInt(req.params.turnCount);
    const t = await findLatestGameTurnByTurnCountUseCase.run(turnCount);
    const responseBody: TurnGetResponseBody = {
      turnCount: t.turnCount,
      board: t.board,
      nextDisc: t.nextDisc ?? null,
      winnerDisc: t.winnerDisc ?? null,
    };

    res.json(responseBody);
  }
);

interface TurnPostRequestBody {
  turnCount: number;
  move: {
    disc: number;
    x: number;
    y: number;
  };
}

turnRouter.post(
  "/api/games/latest/turns",
  // express.RequestをするとpaseIntが必要なくなる
  async (req: express.Request<{}, {}, TurnPostRequestBody>, res) => {
    const turnCount = req.body.turnCount;
    const disc = toDisc(req.body.move.disc);
    const point = new Point(req.body.move.x, req.body.move.y);
    await registerTurnUseCase.run(turnCount, disc, point);
    // 1つ前のターンを取得
    res.status(201).end();
  }
);
