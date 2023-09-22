import { RGBA, Timer } from "../types/Game.types";

export function turnDelayIsOver(timer: number) {
  return new Date().getTime() - timer >= 1000;
}

export function colorHexToRgb(hexaColor: string): RGBA {
  const r = parseInt(hexaColor.slice(1, 3), 16);
  const g = parseInt(hexaColor.slice(3, 5), 16);
  const b = parseInt(hexaColor.slice(5, 7), 16);

  const rgb: RGBA = { r, g, b, a: 1 };
  return rgb;
}

export function colorRgbToHex(rgbColor: RGBA): string {
  const { r, g, b } = rgbColor;
  const hexaColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  return hexaColor;
}

export function defineTimer(
  second: number,
  reason:
    | "Start"
    | "ReStart"
    | "Round"
    | "Serve"
    | "Pause"
    | "Deconnection"
    | "Finished",
  playerName?: string
): Timer {
  return {
    end: new Date().getTime() + second * 1000,
    reason: reason,
    playerName: playerName,
  };
}
