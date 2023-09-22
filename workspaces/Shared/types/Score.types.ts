export type Round = {
  left: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  right: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

export type ScoreInfo = {
  id: string;
  leftRound: 0 | 1 | 2 | 3 | 4 | 5;
  rightRound: 0 | 1 | 2 | 3 | 4 | 5;
  round: Round[];
  rageQuit: "Left" | "Right" | "";
  disconnect: "Left" | "Right" | "";
  leftPause: 0 | 1 | 2 | 3;
  rightPause: 0 | 1 | 2 | 3;
};

export type ScoreUpdate = {
  actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  left: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  right: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  leftRound: 0 | 1 | 2 | 3 | 4 | 5;
  rightRound: 0 | 1 | 2 | 3 | 4 | 5;
};
