import {
  FindLastGamesQueryModel,
  FindLastGamesQueryService,
} from "../../application/query/findLastGamesQueryService";
import mysql, { RowDataPacket } from "mysql2/promise";

type LastGame = RowDataPacket & {
  gameId: FindLastGamesQueryModel["gameId"];
  darkMoveCount: FindLastGamesQueryModel["darkMoveCount"];
  lightMoveCount: FindLastGamesQueryModel["lightMoveCount"];
  winnerDisc: FindLastGamesQueryModel["winnerDisc"];
  startedAt: FindLastGamesQueryModel["startedAt"];
  endAt: FindLastGamesQueryModel["endAt"];
};

export class FindLastGamesMySQLQueryService
  implements FindLastGamesQueryService
{
  async query(
    conn: mysql.Connection,
    limit: number
  ): Promise<FindLastGamesQueryModel[]> {
    const selectResult = await conn.execute<LastGame[]>(
      `
        select
          max(g.id) as gameId,
          count(case when m.disc = 1 then 1 end) as darkMoveCount,
          count(case when m.disc = 2 then 1 end) as lightMoveCount,
          max(gr.winner_disc) as winnerDisc,
          max(g.started_at) as startedAt,
          max(gr.end_at) as endAt
        from
        games g
        left join game_results gr on g.id = gr.game_id
        left join turns t on g.id = t.game_id
        left join moves m on t.id = m.turn_id
        group by g.id
        order by g.id desc
        limit ?
      `,
      [limit.toString()]
    );
    const records = selectResult[0];

    return records.map(
      (r) =>
        new FindLastGamesQueryModel(
          r.gameId,
          r.darkMoveCount,
          r.lightMoveCount,
          r.winnerDisc,
          r.startedAt,
          r.endAt
        )
    );
  }
}
