import { Disc } from "./disc";
import { Point } from "./point";

export class Move {
  constructor(private _disc: Disc, private _point: Point) {}

  get disc(): Disc {
    return this._disc;
  }

  get point(): Point {
    return this._point;
  }
}
