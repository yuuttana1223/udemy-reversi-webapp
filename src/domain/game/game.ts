export class Game {
  constructor(private _id: number | undefined, private _startedAt: Date) {}

  get id(): number | undefined {
    return this._id;
  }

  get startedAt(): Date {
    return this._startedAt;
  }
}
