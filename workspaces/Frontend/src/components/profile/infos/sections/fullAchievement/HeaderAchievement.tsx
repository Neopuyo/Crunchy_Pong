import { UserAchievement } from "@transcendence/shared/types/Achievement.types";
import styles from "@/styles/profile/Achievements/HeaderAchievement.module.css";
import ProgressBar from "./ProgressBar";

export default function HeaderAchievement({ achievements }: {
  achievements: UserAchievement[];
}) {

  const total: number = achievements.length;
  let   completed: number = 0;

  achievements.forEach(achievement => {
    if (achievement.completed)
      completed++;
  })

  return (
	<div className={styles.all}>
		<h3>Achievements</h3>
    <div className={styles.progressBarFrame}>
      <ProgressBar barColor={"var(--accent2)"} value={completed/total * 100} height={10} />
    </div>
    <p>Total: {completed} / {total} </p>
	</div>
  )
}
