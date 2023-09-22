import { useState, useEffect } from "react";
import { GameData } from "@transcendence/shared/types/Game.types";
import styles from "@/styles/game/gameEnd/GameEnd.module.css";
import { useRouter } from "next/navigation";
import LoadingComponent from "../../loading/Loading";
import DisplayXP from "./DisplayXP";
import StatsService from "@/services/Stats.service";
import disconnect from "@/lib/disconnect/disconnect";
import LevelUp from "./LevelUp";

type Props = {
  gameData: GameData;
  isPlayer: "Left" | "Right" | "Spectator";
  userId: number;
};

export default function GameEnd({ gameData, isPlayer, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const statsService = new StatsService();
  const [newLevel, setNewLevel] = useState<number>(0);
  const router = useRouter();
  let winner =
    gameData.result === "Host" && gameData.hostSide === "Left"
      ? gameData.playerLeft.name
      : gameData.result === "Opponent" && gameData.hostSide === "Right"
      ? gameData.playerLeft.name
      : gameData.playerRight.name;

  if (winner.length > 10) {
    winner = winner.substring(0, 10) + "...";
  }

  gameData.winSide =
    gameData.result === "Host"
      ? gameData.hostSide
      : gameData.hostSide === "Left"
      ? "Right"
      : "Left";

  function backHome() {
    router.push("/home?home");
    setLoading(true);
  }

  useEffect(() => {
    const getUserLevel = async () => {
      try {
        const ret = await statsService.getUserLevelUp(userId);
        if (ret.data) {
          setNewLevel(ret.data);
        }
      } catch (error: any) {
        if (error.message === "disconnect") {
          await disconnect();
          router.refresh();
          return;
        }
        if (
          process.env &&
          process.env.ENVIRONNEMENT &&
          process.env.ENVIRONNEMENT === "dev"
        )
          console.log("Error fetching score: " + error);
      }
      try {
      } catch (error) {
        if (
          process.env &&
          process.env.ENVIRONNEMENT &&
          process.env.ENVIRONNEMENT === "dev"
        )
          console.log("error");
      }
    };

    getUserLevel();
  }, []);

  return (
    <div className={styles.gameEnd}>
      <div className={styles.winner}>
        <h2 className={styles.winnerName}>{winner}</h2>
        <h3 className={styles.winnerText}>{`won the game !`}</h3>
      </div>
      {isPlayer !== "Spectator" && newLevel === 0 && gameData.winSide && (
        <>
          <DisplayXP
            mode={gameData.mode}
            side={isPlayer}
            winSide={gameData.winSide}
            score={gameData.score}
            nbRound={gameData.actualRound}
            maxPoint={gameData.maxPoint}
          />
          <button
            className={styles.homeBtn}
            onClick={backHome}
            disabled={loading}
          >
            {!loading && "Back Home"}
            {loading && <LoadingComponent />}
          </button>
        </>
      )}
      {isPlayer !== "Spectator" && newLevel > 0 && (
        <LevelUp newLevel={newLevel} setNewLevel={setNewLevel} />
      )}
    </div>
  );
}
