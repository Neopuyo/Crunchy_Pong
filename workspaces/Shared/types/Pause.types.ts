export type Pause = {
  active: boolean;
  left: 0 | 1 | 2 | 3;
  right: 0 | 1 | 2 | 3;
  status: "Left" | "Right" | "None";
};

export type PauseUpdate = {
  left: 0 | 1 | 2 | 3;
  right: 0 | 1 | 2 | 3;
};
