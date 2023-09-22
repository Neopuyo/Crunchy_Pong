import { ShortStats } from "./Stats.types";

export type UserAchievement = {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  xp: number;
  completed: boolean;
  collected: boolean;
  date: Date;
  icone: string;
  value: number;
};

export type AchievementStatus = {
  id: number;
  completed: boolean;
  collected: boolean;
  date: Date;
};

export type AchievementAnnonce = {
  userId: string;
  achievement: UserAchievement;
};

export type FullAchivement = {
  achievement: UserAchievement[];
  stats: ShortStats;
};
