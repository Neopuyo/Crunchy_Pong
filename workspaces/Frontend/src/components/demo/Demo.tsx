"use client";

// Import des composants react
import { useEffect, useState } from "react";

// Import du style
import styles from "@/styles/demo/Demo.module.css";

// Import des composants
import { GameData } from "@transcendence/shared/types/Game.types";
import {
  initPlayerDemo,
  initPong,
  initScoreDemo,
} from "@transcendence/shared/game/initPong";
import PongDemo from "./PongDemo";
import { AI_DEMO, AI_ID } from "@transcendence/shared/constants/Game.constants";
import LoadingComponent from "../loading/Loading";
import StatsService from "@/services/Stats.service";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  userId: number | undefined;
  login: string;
  demoData: CreateDemo;
  setShowDemo: Function;
  scrollTop: boolean;
};

export default function Demo({
  userId,
  login,
  demoData,
  setShowDemo,
  scrollTop = true,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData>();
  const router = useRouter();

  //------------------------------------Chargement------------------------------------//

  useEffect(() => {
    const setDemo = async () => {
      const demo: GameData = initPong({
        id: "Demo",
        name: demoData.name,
        type: demoData.type,
        mode: "Training",
        hostSide: demoData.side,
        actualRound: 0,
        maxPoint: demoData.maxPoint,
        maxRound: demoData.maxRound,
        difficulty: demoData.difficulty,
        push: demoData.push,
        pause: demoData.pause,
        background: demoData.background,
        ball: demoData.ball,
        score: initScoreDemo(),
      });
      demo.playerLeft = initPlayerDemo(
        demoData.side === "Left" ? AI_DEMO : AI_ID,
        "Left",
        demoData.side === "Left" ? `Futur ${login}` : `Coach ${demoData.type}`
      );
      demo.playerRight = initPlayerDemo(
        demoData.side === "Right" ? AI_DEMO : AI_ID,
        "Right",
        demoData.side === "Right" ? `Futur ${login}` : `Coach ${demoData.type}`
      );
      demo.demo = true;
      if (userId) {
        const statsService = new StatsService();
        try {
          await statsService.updateDemoWatched(userId);
        } catch (error: any) {
          if (error.message === "disconnect") {
            await disconnect();
            router.refresh();
            return;
          }
          console.error("Error updating demo watched:", error.message);
        }
      }
      setGameData(demo);
      setIsLoading(false);
    };
    setDemo();
  }, []);

  //------------------------------------RENDU------------------------------------//
  if (isLoading) {
    return (
      <div className={userId === undefined ? styles.gameLoading : ""}>
        <LoadingComponent />
      </div>
    );
  }

  if (!isLoading && gameData) {
    return (
      <div className={userId === undefined ? styles.demo : ""}>
        <PongDemo
          userId={userId}
          gameData={gameData}
          setGameData={setGameData}
          setShowDemo={setShowDemo}
          scrollTop={scrollTop}
        />
      </div>
    );
  }
}
