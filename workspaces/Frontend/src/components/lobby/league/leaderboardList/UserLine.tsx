"use client";

// PartyInfo.tsx
import styles from "@/styles/lobby/league/leaderboardList/UserLine.module.css";
import { useRouter } from "next/navigation";
import { UserLeaderboard } from "@transcendence/shared/types/Leaderboard.types";
import AvatarUser from "@/components/avatarUser/AvatarUser";

type Props = {
  userLeaderboard: UserLeaderboard;
};

export default function UserLine({ userLeaderboard }: Props) {
  const router = useRouter();

  function seeProfile(userId: number) {
    if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log("see profile", userId);
    const url = "home/profile/" + userId;
    router.push(url);
  }

  function displayRank() {
    let rank;
    if (userLeaderboard.rank === 0) {
      rank = "-";
    } else if (userLeaderboard.rank === 1) {
      rank = `${userLeaderboard.rank}st`;
    } else if (userLeaderboard.rank === 2) {
      rank = `${userLeaderboard.rank}nd`;
    } else if (userLeaderboard.rank === 3) {
      rank = `${userLeaderboard.rank}rd`;
    } else {
      rank = `${userLeaderboard.rank}th`;
    }
    return rank;
  }

  return (
    <div className={styles.userLine}>
      <button
        className={styles.cruncher}
        onClick={() => seeProfile(userLeaderboard.userId)}
      >
        <div className={styles.avatar}>
          <AvatarUser
            avatar={userLeaderboard.avatar}
            borderSize={"3px"}
            backgroundColor={userLeaderboard.avatar.backgroundColor}
            borderColor={userLeaderboard.avatar.borderColor}
            fontSize="1rem"
          />
        </div>
        <span>{userLeaderboard.login}</span>
      </button>
      <p className={styles.rank}>{displayRank()}</p>
      <p className={styles.points}>{userLeaderboard.points}</p>
      <p className={styles.win}>{userLeaderboard.win}</p>
      <p className={styles.loss}>{userLeaderboard.lost}</p>
    </div>
  );
}
