import styles from "@/styles/profile/InfoCard.module.css";
import Item from "./Item";
import MottoDisplayOnly from "./custom/tagline/MottoDisplayOnly";
import StoryDisplayOnly from "./custom/story/StoryDisplayOnly";
import { useEffect, useState } from "react";
import StatsService from "@/services/Stats.service";
import StoryLevel from "./ItemContent/StoryLevel";
import Winrate from "./ItemContent/Winrate";
import Rank from "./ItemContent/Rank";
import XPBar from "./ItemContent/XPBar";
import { ShortStats } from "@transcendence/shared/types/Stats.types";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";
import LastAchievement from "./lastAchievement/LastAchievement";
import { Socket } from "socket.io-client";

type Props = {
  profile: Profile;
  socket: Socket | undefined;
  isOwner: boolean;
};

export default function SectionPongStats({ profile, socket, isOwner }: Props) {
  const [stats, setStats] = useState<ShortStats>({
    leagueRank: 0,
    leaguePoints: 0,

    leveling: {
      level: 1,
      userXp: 0,
      nextLevelXP: 100,
      cumulativeXpToNext: 0,
      progress: 0,
    },
    gameWon: 0,
    gameLost: 0,
    leagueWon: 0,
    leagueLost: 0,
    partyWon: 0,
    partyLost: 0,
    trainingWon: 0,
    trainingLost: 0,
    demoWatched: 0,
    storyLevelCompleted: 0,
    userLevel: 1,
  });
  const statService = new StatsService(undefined);
  const router = useRouter();

  const loadStats = async () => {
    try {
      const rep = await statService.getShortStats(profile.id);

      if (rep.success && rep.data) {
        setStats(rep.data);
      } else {
        throw new Error(rep.message);
      }
    } catch (error: any) {
      if (error.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(`loadStats error : ${error.message}`);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className={`${styles.sections} ${styles.columnStart}`}>
      <MottoDisplayOnly profile={profile} />

      <StoryDisplayOnly profile={profile} />

      <p className={styles.tinyTitle}>Level</p>
      <XPBar
        userLevel={
          stats.leveling
            ? stats.leveling
            : {
                level: 1,
                userXp: 0,
                nextLevelXP: 100,
                cumulativeXpToNext: 0,
                progress: 0,
              }
        }
      />

      <p className={styles.tinyTitle}>League</p>
      <div className={styles.leagueContainer}>
        <Rank rank={stats.leagueRank} leaguePoints={stats.leaguePoints} />
        <div className={styles.subLeagueContainer}>
          <Item title="League Winrate">
            <Winrate
              winData={{
                gameWon: stats.leagueWon,
                gameLost: stats.leagueLost,
                showPlaceholder: true,
              }}
            />
          </Item>
        </div>
      </div>

      <p className={styles.tinyTitle}>Play for fun</p>
      <Item title="Story Level">
        <StoryLevel storyLevel={stats.storyLevelCompleted} />
      </Item>

      <Item title="Global Winrate">
        <Winrate
          winData={{
            gameWon: stats.gameWon,
            gameLost: stats.gameLost,
            showPlaceholder: true,
          }}
        />
      </Item>

      <Item title="Recent Achievements">
        <LastAchievement
          profile={profile}
          setStats={setStats}
          statsService={statService}
          socket={socket}
          isOwner={isOwner}
        />
      </Item>
    </div>
  );
}
