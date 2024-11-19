import express from "express";
import { TurnService } from "../application/turnService";

export const turnRouter = express.Router();

const turnService = new TurnService();

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
    const t = await turnService.findLatestGameTurnByTurnCount(turnCount);
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
    const disc = req.body.move.disc;
    const x = req.body.move.x;
    const y = req.body.move.y;
    await turnService.registerTurn(turnCount, disc, x, y);
    // 1つ前のターンを取得
    res.status(201).end();
  }
);
