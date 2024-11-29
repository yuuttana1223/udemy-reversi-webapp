import { DomainError } from "../../error/domainError";

export const WinnerDisc = {
  Draw: 0,
  Dark: 1,
  Light: 2,
} as const;

export type WinnerDisc = (typeof WinnerDisc)[keyof typeof WinnerDisc];

export function toWinnerDisc(value: number): WinnerDisc {
  switch (value) {
    case WinnerDisc.Draw:
      return WinnerDisc.Draw;
    case WinnerDisc.Dark:
      return WinnerDisc.Dark;
    case WinnerDisc.Light:
      return WinnerDisc.Light;
    default:
      throw new DomainError(
        "InvalidWinnerDiscValue",
        `Invalid winner disc value: ${value}`
      );
  }
}
