type CreateTrainingDTO = {
  name: string;
  type: "Classic" | "Best3" | "Best5" | "Custom" | "Story";
  storyLevel?: number;
  player: number;
  side: "Left" | "Right";
  maxPoint: 3 | 5 | 7 | 9;
  maxRound: 1 | 3 | 5 | 7 | 9;
  difficulty: -2 | -1 | 0 | 1 | 2;
  push: boolean;
  pause: boolean;
  background: string;
  ball: string;
};

type UpdateTrainingDTO = {
  status: "Not Started" | "Stopped" | "Playing" | "Finished" | "Deleted";
  result: "Not Finished" | "Host" | "Opponent" | "Deleted";
  actualRound: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};
