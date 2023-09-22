import styles from "@/styles/game/gameEnd/DisplayXP.module.css";
import { Result, XP } from "@transcendence/shared/types/Stats.types";
import { ScoreInfo } from "@transcendence/shared/types/Score.types";
import { calculateXP } from "@transcendence/shared/game/calculateXP";

function defineXP(
  side: "Left" | "Right",
  winSide: "Left" | "Right",
  score: ScoreInfo,
  nbRound: number
): Result {
  let result: Result = {
    win: false,
    rageQuit: false,
    roundWin: 0,
    roundLost: 0,
    pointWin: 0,
    pointLost: 0,
  };
  if (winSide === side) {
    result.win = true;
  }
  if (score.rageQuit) {
    result.rageQuit = true;
  }
  result.roundWin = side === "Left" ? score.leftRound : score.rightRound;
  result.roundLost = side === "Left" ? score.rightRound : score.leftRound;
  let leftPointWin = 0;
  let rightPointWin = 0;
  for (let i = 0; i < nbRound; i++) {
    leftPointWin += score.round[i].left;
    rightPointWin += score.round[i].right;
  }
  result.pointWin = side === "Left" ? leftPointWin : rightPointWin;
  result.pointLost = side === "Left" ? rightPointWin : leftPointWin;
  return result;
}

function DisplayItemXP({ title, item }: { title: string; item: number }) {
  return (
    <div className={styles.details}>
      <h4 className={styles.detailsTitle}>{title}</h4>
      <p className={styles.detailsItem}>{item}</p>
    </div>
  );
}

type Props = {
  mode: "League" | "Party" | "Training";
  side: "Left" | "Right";
  winSide: "Left" | "Right";
  score: ScoreInfo;
  nbRound: number;
  maxPoint: 3 | 5 | 7 | 9;
};

export default function DisplayXP({
  mode,
  side,
  winSide,
  score,
  nbRound,
  maxPoint,
}: Props) {
  const result: Result = defineXP(side, winSide, score, nbRound);
  const xp: XP = calculateXP(result, maxPoint);

  return (
    <div className={styles.displayXP}>
      <div className={styles.xpItem}>
        <DisplayItemXP
          title="Game"
          item={mode === "League" ? xp.game : xp.game > 0 ? xp.game : 0}
        />
        <DisplayItemXP
          title="Round"
          item={mode === "League" ? xp.round : xp.round > 0 ? xp.round : 0}
        />
        <DisplayItemXP
          title="Point"
          item={mode === "League" ? xp.point : xp.point > 0 ? xp.point : 0}
        />
        {xp.rageQuit !== 0 && (
          <DisplayItemXP
            title="Rage Quit"
            item={
              mode === "League"
                ? xp.rageQuit
                : xp.rageQuit > 0
                ? xp.rageQuit
                : 0
            }
          />
        )}
      </div>
      <div className={styles.total}>
        <h3 className={styles.totalTitle}>Total</h3>
        <p className={styles.totalItem}>
          {mode === "League" ? xp.total : xp.total > 0 ? xp.total : 0}
        </p>
      </div>
    </div>
  );
}
