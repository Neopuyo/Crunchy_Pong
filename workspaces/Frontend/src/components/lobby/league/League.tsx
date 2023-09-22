"use client";

import styles from "@/styles/lobby/league/League.module.css";
import { useEffect, useState } from "react";
import LobbyService from "@/services/Lobby.service";
import Searching from "@/components/lobby/league/Searching";
import LobbyList from "@/components/lobby/lobbyList/LobbyList";
import LeaderboardList from "@/components/lobby/league/leaderboardList/LeaderboardList";
import LeaderboardPodium from "@/components/lobby/league//LeaderboardPodium";
import { UserLeaderboard } from "@transcendence/shared/types/Leaderboard.types";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

export default function League({ profile }: { profile: Profile }) {
  const lobbyService = new LobbyService();
  const [leaderboardData, setLeadeboardData] = useState<
    UserLeaderboard[] | undefined
  >(undefined);
  const router = useRouter();

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const ret = await lobbyService.getLeaderboard();
        if (!ret.success) {
          console.error("Error fetching leaderboard", ret);
          return;
        }
        setLeadeboardData(ret.data);
      } catch (error: any) {
        if (error.message === "disconnect") {
          await disconnect();
          router.refresh();
          return;
        }
        console.error("Error fetching leaderboard", error);
      }
    };

    getLeaderboard();

    const interval = setInterval(getLeaderboard, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.league}>
      <div className={styles.displayLeague}>
        <div className={styles.resume}>
          <Searching profile={profile} />
          <LeaderboardPodium leaderboardData={leaderboardData} />
        </div>
        <LeaderboardList leaderboardData={leaderboardData} />
      </div>
      <LobbyList lobbyService={lobbyService} mode={"League"} />
    </div>
  );
}
