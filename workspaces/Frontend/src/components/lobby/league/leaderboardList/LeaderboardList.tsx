"use client";

// PartyList.tsx
import styles from "@/styles/lobby/league/leaderboardList/LeaderboardList.module.css";
import UserLine from "./UserLine";
import { UserLeaderboard } from "@transcendence/shared/types/Leaderboard.types";

type Props = {
  leaderboardData: UserLeaderboard[] | undefined;
};

export default function LeaderboardList({ leaderboardData }: Props) {
  return (
    <div className={styles.partyList}>
      <h2 className={styles.listTitle}>Leaderboard</h2>
      <div className={styles.list}>
        <div className={styles.listHead}>
          <p className={styles.cruncher}>Cruncher</p>
          <p className={styles.rank}>Rank</p>
          <p className={styles.points}>Points</p>
          <p className={styles.win}>Win</p>
          <p className={styles.loss}>Loss</p>
        </div>
        {!leaderboardData && <p className={styles.loading}>Loading...</p>}
        {leaderboardData && leaderboardData.length === 0 && (
          <p className={styles.loading}>No user founded</p>
        )}
        {leaderboardData && leaderboardData.length > 0 && (
          <div className={styles.listBody}>
            {leaderboardData.map((userLeaderboard: UserLeaderboard) => (
              <UserLine
                key={userLeaderboard.userId}
                userLeaderboard={userLeaderboard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
