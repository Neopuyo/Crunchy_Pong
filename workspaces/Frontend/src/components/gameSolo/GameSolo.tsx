"use client";

// Import des composants react
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import du style
import styles from "@/styles/game/Game.module.css";

// Import des services
import TrainingService from "@/services/Training.service";

// Import des composants
import { GameData } from "@transcendence/shared/types/Game.types";
import PongSolo from "./PongSolo";
import LoadingComponent from "../loading/Loading";
import disconnect from "@/lib/disconnect/disconnect";
import ErrorHandler from "../error/ErrorHandler";

type Props = {
  profile: Profile;
  trainingId: string;
};

export default function GameSolo({ profile, trainingId }: Props) {
  const router = useRouter();
  const trainingService = new TrainingService();

  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData>();
  const [error, setError] = useState<boolean>(false);
  const [isPlayer, setIsPlayer] = useState<"Left" | "Right" | "">("");

  //------------------------------------Chargement------------------------------------//

  useEffect(() => {
    const getData = async () => {
      try {
        if (isLoading) {
          const ret = await trainingService.getTrainingData(trainingId);
          if (ret.success == false) {
            setError(true);
          } else {
            if (
              process.env &&
              process.env.ENVIRONNEMENT &&
              process.env.ENVIRONNEMENT === "dev"
            )
              console.log(ret.data);
            if (ret.data.status === "Finished") {
              router.push("/home?home");
            } else {
              setGameData(ret.data);
              setIsLoading(false);
            }
            if (ret.data.playerLeft.id === profile.id) {
              setIsPlayer("Left");
            } else if (ret.data.playerRight.id === profile.id) {
              setIsPlayer("Right");
            } else {
              setIsPlayer("");
              setError(true);
            }
          }
        }
      } catch (error: any) {
        await disconnect();
        router.refresh();
        return;
      }
    };

    getData();
  }, []);

  //------------------------------------RENDU------------------------------------//

  //Si une erreur est survenue
  if (error) {
    return <ErrorHandler errorTitle={"Oops, something went wrong"} errorNotif={"Please try again later"} />;
  }

  //Si la page n'est pas chargé
  if (isLoading) {
    return (
      <div className={styles.game}>
        <div className={styles.gameLoading}>
          <LoadingComponent />
        </div>
      </div>
    );
  }

  if (!isLoading && gameData) {
    return (
      <div className={styles.game}>
        <PongSolo
          profile={profile}
          gameData={gameData}
          setGameData={setGameData}
          isPlayer={isPlayer}
          trainingService={trainingService}
        />
      </div>
    );
  }
}
