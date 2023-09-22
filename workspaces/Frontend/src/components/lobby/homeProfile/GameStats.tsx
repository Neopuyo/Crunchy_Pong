import styles from "@/styles/lobby/homeProfile/GameStats.module.css";
import StatsService from "@/services/Stats.service";
import { useState, useEffect } from "react";
import { ShortStats } from "@transcendence/shared/types/Stats.types";
import Rank from "@/components/profile/infos/sections/ItemContent/Rank";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";
import XPBar from "@/components/profile/infos/sections/ItemContent/XPBar";
import LastAchievement from "@/components/profile/infos/sections/lastAchievement/LastAchievement";
import Item from "@/components/profile/infos/sections/Item";
import StoryLevel from "@/components/profile/infos/sections/ItemContent/StoryLevel";
import StoryService from "@/services/Story.service";
import { Socket } from "socket.io-client";

type Props = {
  profile: Profile;
  socket: Socket | undefined;
};

export default function GameStats({ profile, socket }: Props) {
  const statsService = new StatsService();
  const [stats, setStats] = useState<ShortStats | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const getStats = async () => {
      try {
        const ret = await statsService.getShortStats(profile.id);
        if (ret.success) {
          setStats(ret.data);
        }
      } catch (error: any) {
        if (error.message === "disconnect") {
          await disconnect();
          router.refresh();
          return;
        }
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.error("Error fetching stats:", error);
      }
    };

    const updateNotif = (payload: {
      why: string;
    }) => {
      if (payload && payload.why && payload.why === "updateAchievements")
        getStats();
    };

    getStats();

    socket?.on('achievement', getStats);
    socket?.on('notif', updateNotif);
    return () => {
      socket?.off('achievement', getStats);
      socket?.off('notif', updateNotif);
    }
  }, []);

  if (!stats) {
    return <p className={styles.loading}>Stats Loading...</p>;
  }

  return (
    <div className={styles.gameStats}>
      {/* STATSBOX1 */}
      <div className={styles.boxItem}>
        <div className={styles.sectionTitle}>
          <h3 className={styles.tinyTitle}>Play for glory</h3>
          <div className={styles.barBottom}></div>
        </div>
        <div className={styles.statsBox}>
          <Rank
            rank={stats ? stats.leagueRank : 0}
            leaguePoints={stats ? stats.leaguePoints : 0}
          />
          <div className={styles.xpBar}>
            <XPBar userLevel={stats.leveling} />
          </div>
        </div>
      </div>

      {/* STATSBOX2 */}
      <div className={styles.boxItem}>
        <div className={styles.sectionTitle}>
          <h3 className={styles.tinyTitle}>Play for fun</h3>
          <div className={styles.barBottom}></div>
        </div>
        <div className={styles.statsBox}>
          <div className={styles.storyBar}>
            <Item title="Story Level">
              <StoryLevel storyLevel={stats.storyLevelCompleted} />
            </Item>
          </div>
          <div className={styles.achievementBar}>
            <LastAchievement
              profile={profile}
              setStats={setStats}
              statsService={statsService}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
