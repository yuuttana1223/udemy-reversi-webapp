export class GameRecord {
  // privateを定義することに暗黙的に初期化される
  constructor(private _id: number, private _started_at: Date) {}

  get id() {
    return this._id;
  }

  get startedAt() {
    return this._started_at;
  }
}
