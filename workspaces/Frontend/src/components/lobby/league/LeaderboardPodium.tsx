import AvatarUser from "@/components/avatarUser/AvatarUser";
import styles from "@/styles/lobby/league/LeaderboardPodium.module.css";
import { UserLeaderboard } from "@transcendence/shared/types/Leaderboard.types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  leaderboardData: UserLeaderboard[] | undefined;
};

export default function LeaderboardPodium({ leaderboardData }: Props) {
  const defaultUser: UserLeaderboard = {
    userId: -1,
    login: " ",
    avatar: {
      image: "",
      text: "?",
      variant: "circular",
      borderColor: "#000000",
      backgroundColor: "#ff253a",
      empty: false,
      decrypt: false,
    },
    points: 0,
    rank: 0,
    win: 0,
    lost: 0,
  };
  const [first, setFirst] = useState<UserLeaderboard>(defaultUser);
  const [second, setSecond] = useState<UserLeaderboard>(defaultUser);
  const [third, setThird] = useState<UserLeaderboard>(defaultUser);
  const router = useRouter();

  function seeProfile(userId: number) {
    if (userId === -1) return;
    const url = "home/profile/" + userId;
    router.push(url);
  }

  useEffect(() => {
    function definePodium() {
      if (leaderboardData) {
        const leaderboardSize = leaderboardData.length;
        if (leaderboardSize === 0) return;
        if (leaderboardSize > 0 && leaderboardData[0].points > 0)
          setFirst(leaderboardData[0]);
        if (leaderboardSize > 1 && leaderboardData[1].points > 0)
          setSecond(leaderboardData[1]);
        if (leaderboardSize > 2 && leaderboardData[2].points > 0)
          setThird(leaderboardData[2]);
      }
    }
    definePodium();
  }, [leaderboardData]);

  function displayCruncher(cruncher: UserLeaderboard) {
    return (
      <button
        className={styles.cruncher}
        onClick={() => seeProfile(cruncher.userId)}
      >
        <div className={styles.avatar}>
          <AvatarUser
            avatar={cruncher.avatar}
            borderSize={"3px"}
            backgroundColor={cruncher.avatar.backgroundColor}
            borderColor={cruncher.avatar.borderColor}
            fontSize="1.3rem"
          />
        </div>
        <span>{cruncher.login}</span>
      </button>
    );
  }

  return (
    <div className={styles.podium}>
      <div className={styles.second}>
        {displayCruncher(second)}
        <h3 className={styles.pad}>2nd</h3>
      </div>
      <div className={styles.first}>
        {displayCruncher(first)}
        <h3 className={styles.pad}>1st</h3>
      </div>
      <div className={styles.third}>
        {displayCruncher(third)}
        <h3 className={styles.pad}>3rd</h3>
      </div>
    </div>
  );
}
