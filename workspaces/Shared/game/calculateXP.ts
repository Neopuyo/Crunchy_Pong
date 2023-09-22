import {
  XP_GAME,
  XP_RAGE,
  XP_POINTDIFF,
  XP_ROUND3,
  XP_ROUND5,
  XP_ROUND7,
  XP_ROUND9,
} from "@transcendence/shared/constants/Xp.constants";
import { Result, XP } from "@transcendence/shared/types/Stats.types";

export function calculateXP(result: Result, maxPoint: 3 | 5 | 7 | 9): XP {
  const xp: XP = {
    game: 0,
    rageQuit: 0,
    round: 0,
    point: 0,
    total: 0,
  };
  xp.game = result.win ? XP_GAME : Math.floor((XP_GAME * -1) / 2);
  xp.rageQuit = result.rageQuit
    ? result.win
      ? XP_RAGE
      : Math.floor((XP_RAGE * -1) / 2)
    : 0;
  xp.round =
    (result.roundWin - result.roundLost) *
    (maxPoint === 9
      ? XP_ROUND9
      : maxPoint === 7
      ? XP_ROUND7
      : maxPoint === 5
      ? XP_ROUND5
      : XP_ROUND3);
  if (xp.round < 0) xp.round = Math.floor(xp.round / 2);
  xp.point = (result.pointWin - result.pointLost) * XP_POINTDIFF;
  if (xp.point < 0) xp.point = Math.floor(xp.point / 2);
  xp.total = xp.game + xp.rageQuit + xp.round + xp.point;
  return xp;
}
