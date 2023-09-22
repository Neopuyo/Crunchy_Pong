type CreateDemo = {
  name: string;
  type: "Classic" | "Best3" | "Best5" | "Custom" | "Story";
  side: "Left" | "Right";
  maxPoint: 3 | 5 | 7 | 9;
  maxRound: 1 | 3 | 5 | 7 | 9;
  difficulty: -2 | -1 | 0 | 1 | 2;
  push: boolean;
  pause: boolean;
  background: string;
  ball: string;
};
