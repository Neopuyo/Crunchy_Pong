import { ScoreInfo } from "./Score.types";
import { Timer, PlayerDynamic, Ball, Action } from "./Game.types";
import { Pause } from "./Pause.types";

export type StatusMessage = {
  status: "Not Started" | "Stopped" | "Playing" | "Finished" | "Deleted";
  result: "Not Finished" | "Host" | "Opponent" | "Deleted";
  winSide: "Left" | "Right";
  playerLeft: "Unknown" | "Connected" | "Playing" | "Paused" | "Disconnected";
  playerRight: "Unknown" | "Connected" | "Playing" | "Paused" | "Disconnected";
  timer: Timer;
  pause: Pause;
};

export type UpdateData = {
  playerLeftDynamic: PlayerDynamic;
  playerRightDynamic: PlayerDynamic;
  ball: Ball;
};

export type ScoreMessage = {
  score: ScoreInfo;
  actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

export type ActionSolo = {
  action: Action;
  side: "Left" | "Right" | "";
};
