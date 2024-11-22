import { Disc } from "../domain/turn/disc";

export const EMPTY = 0;
export const DARK = 1;
export const LIGHT = 2;

const { Empty: E, Dark: D, Light: L } = Disc;

export const INITIAL_BOARD: Disc[][] = [
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, D, L, E, E, E],
  [E, E, E, L, D, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
];
