import { DomainError } from "../error/domainError";

const MIN_POINT = 0;
const MAX_POINT = 7;

export class Point {
  constructor(private _x: number, private _y: number) {
    const isXValid = _x >= MIN_POINT && _x <= MAX_POINT;
    const isYValid = _y >= MIN_POINT && _y <= MAX_POINT;
    if (!isXValid || !isYValid) {
      throw new DomainError(
        "InvalidPoint",
        `Invalid point. x: ${_x}, y: ${_y}`
      );
    }
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}
