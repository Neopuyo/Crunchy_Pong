"use client";

// PartyInfo.tsx
import { useState } from "react";
import styles from "@/styles/lobby/lobbyList/GameLine.module.css";
import ScoreService from "@/services/Score.service";
import LobbyService from "@/services/Lobby.service";
import { GameInfo } from "@transcendence/shared/types/Game.types";
import GameDetails from "./GameDetails";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PlayerInfo from "./PlayerInfo";
import disconnect from "@/lib/disconnect/disconnect";

type Props = {
  lobbyService: LobbyService;
  scoreService: ScoreService;
  gameInfo: GameInfo;
};

export default function GameLine({
  lobbyService,
  scoreService,
  gameInfo,
}: Props) {
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);

  async function joinGame() {
    try {
      const res: ReturnData = await lobbyService.joinGame(gameInfo.id);
      await toast.promise(new Promise((resolve) => resolve(res)), {
        pending: "Joing game...",
        success: "Good Luck !",
        error: "Error joining game",
      });
      if (!res.success) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev") {
          console.log(res.message);
          console.log(res.error);
        }
        return;
      }
      const url = "home/game/" + res.data;
      router.push(url);
    }
    catch (error: any) {
      if (error.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
    }
  }

  function watchGame() {
    const url = "home/game/" + gameInfo.id;
    router.push(url);
  }

  return (
    <>
      <div className={styles.gameLine}>
        <button
          className={styles.nameBtn}
          onClick={() => {
            setShowDetail(!showDetail);
          }}
        >
          {gameInfo.name}
        </button>
        <p className={styles.typeInfo}>{gameInfo.type}</p>
        <PlayerInfo
          playerLeft={gameInfo.leftPlayer}
          playerRight={gameInfo.rightPlayer}
          showDetail={showDetail}
        />
        <p className={styles.roundInfo}>
          {gameInfo.actualRound + 1} / {gameInfo.maxRound}
        </p>
        <p className={styles.statusInfo}>{gameInfo.status}</p>
        <div className={styles.actionInfo}>
          {(gameInfo.leftPlayer.id === -1 ||
            gameInfo.rightPlayer.id === -1) && (
            <button className={styles.actionBtn} onClick={joinGame}>
              Join
            </button>
          )}
          {gameInfo.leftPlayer.id !== -1 && gameInfo.rightPlayer.id !== -1 && (
            <button className={styles.actionBtn} onClick={watchGame}>
              Watch
            </button>
          )}
        </div>
      </div>
      {showDetail && (
        <GameDetails scoreService={scoreService} gameInfo={gameInfo} />
      )}
    </>
  );
}
