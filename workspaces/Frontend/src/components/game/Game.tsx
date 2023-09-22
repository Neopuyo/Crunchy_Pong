"use client";

// Import des composants react
import { useEffect, useState } from "react";

// Import du style
import styles from "@/styles/game/Game.module.css";

// Import des services
import LobbyService from "@/services/Lobby.service";
import GameService from "@/services/Game.service";

// Import des composants
import Pong from "./Pong";
import { GameData } from "@transcendence/shared/types/Game.types";
import LoadingComponent from "../loading/Loading";
import ErrorHandler from "../error/ErrorHandler";

type Props = {
  profile: Profile;
  token: String | undefined;
  gameId: String | undefined;
};

export default function Game({ profile, token, gameId }: Props) {
  const lobby = new LobbyService();

  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData>();
  const [error, setError] = useState<boolean>(false);
  const gameService = new GameService(token as string);
  const [joinEmitter, setJoinEmitter] = useState<boolean>(false);
  const [isPlayer, setIsPlayer] = useState<"Left" | "Right" | "Spectator">(
    "Spectator"
  );

  //------------------------------------Chargement------------------------------------//

  useEffect(() => {
    const joinGame = async () => {
      if (!joinEmitter && gameService.socket) {
        setJoinEmitter(true);
        try {
          const response = await new Promise(() => {
            gameService.socket?.emit("join", gameId, (ret: ReturnData) => {
              if (ret.success) {
                setIsLoading(false);
                setGameData(ret.data);
                setIsPlayer(
                  ret.data.playerLeft.id === profile.id
                    ? "Left"
                    : ret.data.playerRight.id === profile.id
                    ? "Right"
                    : "Spectator"
                );
              } else {
                throw new Error(ret.message);
              }
            });
          });
        } catch (error) {
          setIsLoading(false);
          setError(true);
          if (
            process.env &&
            process.env.ENVIRONNEMENT &&
            process.env.ENVIRONNEMENT === "dev"
          ) {
            console.error(error);
          }
        }
      }
    };

    joinGame();

    gameService.socket?.on("exception", () => {
      setError(true);
    });

    return () => {
      gameService.socket?.off("exception");
    };
  }, [gameId, gameService.socket, profile, joinEmitter]);

  //------------------------------------RENDU------------------------------------//

  //Si une erreur est survenue
  if (!gameService.socket || error) {
    return (
      <ErrorHandler
        errorTitle={"Oops, something went wrong"}
        errorNotif={"Please try again later"}
        inGame={true}
        refresh={false}
      />
    );
  }

  // if (!isLoading && !gameData) {
  //   return (
  //     <ErrorHandler
  //       errorTitle={"Oops, something went wrong"}
  //       errorNotif={"Please try again later"}
  //       inGame={true}
  //       refresh={true}
  //     />
  //   );
  // }

  //Si la page n'est pas chargé
  if (isLoading) {
    return (
      <div className={styles.gameLoading}>
        <LoadingComponent />
      </div>
    );
  }

  if (!isLoading && gameData && gameService.socket) {
    return (
      <div className={styles.game}>
        <Pong
          profile={profile}
          gameData={gameData}
          setGameData={setGameData}
          socket={gameService.socket}
          isPlayer={isPlayer}
          gameService={gameService}
          lobby={lobby}
        ></Pong>
      </div>
    );
  }
}
