import styles from "@/styles/profile/ItemContent.module.css";
import { UserLevel } from "@transcendence/shared/types/Stats.types";
import { useState } from "react";

type Props = {
  userLevel: UserLevel;
};

type DisplayMode = "percent" | "needToUp" | "totalXp";

export default function XPBar({ userLevel }: Props) {
  const [mode, setMode] = useState<DisplayMode>("percent");

  const whatToDisplay = (mode: DisplayMode): string => {
    switch (mode) {
      case "percent":
        return `${userLevel.progress}% of level completion`;
      case "needToUp":
        return `${
          userLevel.cumulativeXpToNext - userLevel.userXp
        } xp to reach level ${userLevel.level + 1}`;
      case "totalXp":
        return `${userLevel.userXp} total xp`;
      default:
        return `${userLevel.progress}% of level completion`;
    }
  };

  const swapMode = () => {
    switch (mode) {
      case "percent":
        setMode("needToUp");
        break;
      case "needToUp":
        setMode("totalXp");
        break;
      case "totalXp":
        setMode("percent");
        break;
      default:
        setMode("percent");
        break;
    }
  };

  return (
    <div className={`${styles.xpFrame} ${styles.row}`}>
      <div className={`${styles.xpLevel} ${styles.row}`}>{userLevel.level}</div>

      <div className={styles.xpCapsule} onClick={swapMode}>
        <div
          className={`${styles.xpBar}`}
          style={{ width: `${userLevel.progress}%` }}
        ></div>
        <div className={styles.xpDigits}>{whatToDisplay(mode)}</div>
      </div>
    </div>
  );
}
