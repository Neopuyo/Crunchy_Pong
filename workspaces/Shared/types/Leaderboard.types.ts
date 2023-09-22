import { Avatar } from "./Avatar.types";

export type UserLeaderboard = {
  userId: number;
  login: string;
  avatar: Avatar;
  points: number;
  rank: number;
  win: number;
  lost: number;
};
