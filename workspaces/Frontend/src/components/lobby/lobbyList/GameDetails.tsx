"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/lobby/lobbyList/GameDetails.module.css";
import ScoreService from "@/services/Score.service";
import { ScoreInfo } from "@transcendence/shared/types/Score.types";
import { GameInfo } from "@transcendence/shared/types/Game.types";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  scoreService: ScoreService;
  gameInfo: GameInfo;
};

export default function GameDetails({ scoreService, gameInfo }: Props) {
  const [score, setScore] = useState<ScoreInfo | undefined>(undefined);
  const router = useRouter();

  //Recupere le score de la game regulierement
  useEffect(() => {
    const getScore = async () => {
      try {
        const data = await scoreService.getScoreByGameId(gameInfo.id);
        setScore(data);
      } catch (error: any) {
        setScore(undefined);
        if (error.message === 'disconnect') {
          await disconnect();
          router.refresh();
          return ;
        }
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log("Error fetching score: " + error);
      }
    };

    // Fetch game list initially
    getScore();

    // Then fetch it every second
    const interval = setInterval(getScore, 1000);

    return () => clearInterval(interval);
  }, []);

  function displayRound(round: Round, index: number) {
    // Determine the className and border color based on the comparison with currentRound
    let roundClassName = styles.round;
    let borderColor = "";

    if (score) {
      if (index < gameInfo.actualRound) {
        roundClassName = styles.roundFinished;
        if (score.round[index].left > score.round[index].right)
          borderColor = gameInfo.leftPlayer.avatar.borderColor;
        else if (score.round[index].left < score.round[index].right)
          borderColor = gameInfo.rightPlayer.avatar.borderColor;
      } else if (index === gameInfo.actualRound) {
        roundClassName = styles.currentRound;
      } else if (index > gameInfo.actualRound) {
        roundClassName = styles.roundRemaining;
      }
    }

    // Define a style object to apply the border color
    const roundStyle = {
      borderColor: borderColor,
    };

    return (
      <div
        key={index}
        className={`${styles.displayRound} ${roundClassName}`}
        style={roundStyle}
      >
        <p className={styles.round}>{`R${index + 1}: `}</p>
        <p className={styles.score}>{`${round.left} / ${round.right}`}</p>
      </div>
    );
  }

  if (!score)
    return (
      <div className={styles.PartyDetails}>
        <div> Loading...</div>
      </div>
    );

  return (
    <div className={styles.showScore}>
      {score.round
        .slice(0, gameInfo.maxRound)
        .map((round, index) => displayRound(round, index))}
    </div>
  );
}
