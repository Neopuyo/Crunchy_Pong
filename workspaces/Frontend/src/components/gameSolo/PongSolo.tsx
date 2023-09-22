"use client";
// Import des composants react
import { useRef, useEffect, useMemo, useState } from "react";

// Import du style
import styles from "@/styles/gameSolo/PongSolo.module.css";

// Import des composants
import Info from "@/components/game/Info";

// Import GameLogic
import { pongKeyDown, pongKeyUp } from "../../lib/game/eventHandlersSolo";
import { gameLoop } from "@/lib/game/gameLoopSolo";
import { GameData, Draw } from "@transcendence/shared/types/Game.types";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  TIMER_START,
  TIMER_RESTART,
} from "@transcendence/shared/constants/Game.constants";
import { defineTimer } from "@transcendence/shared/game/pongUtils";
import TrainingService from "@/services/Training.service";
import PongSoloHead from "./PongSoloHead";
import PlayerPreview from "@/components/game/PlayerPreview";
import GameEnd from "@/components/game/gameEnd/GameEnd";

type Props = {
  profile: Profile;
  gameData: GameData;
  setGameData: Function;
  isPlayer: "Left" | "Right" | "";
  trainingService: TrainingService;
};

export default function Pong({
  profile,
  gameData,
  setGameData,
  isPlayer,
  trainingService,
}: Props) {
  const pongRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMountedRef = useRef(true);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(true);
  const [showGameEnd, setShowGameEnd] = useState(false);

  const backgroundImage = useMemo(() => {
    const image = new Image();
    image.src = `/images/background/${gameData.background}.png`;
    return image;
  }, [gameData.background]);

  const ballImage = useMemo(() => {
    const image = new Image();
    image.src = `/images/ball/${gameData.ballImg}.png`;
    return image;
  }, [gameData.ballImg]);

  useEffect(() => {
    if (showPreview) return;
    const draw: Draw = {
      canvas: canvasRef.current!,
      context: canvasRef.current!.getContext("2d")!,
      backgroundImage: backgroundImage,
      ballImage: ballImage,
    };
    draw.canvas.focus();

    isMountedRef.current = true;

    if (animationFrameIdRef.current === undefined) {
      animationFrameIdRef.current = requestAnimationFrame((timestamp) =>
        gameLoop(timestamp, gameData, setGameData, draw, isMountedRef, false)
      );
    }
    return () => {
      isMountedRef.current = false;
      if (animationFrameIdRef.current !== undefined) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
    };
  }, [showPreview]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      pongKeyDown(
        profile,
        event,
        gameData,
        isPlayer === "Left" ? "Left" : "Right"
      );
    }

    function handleKeyUp(event: KeyboardEvent) {
      pongKeyUp(gameData, isPlayer);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameData]);

  useEffect(() => {
    pongRef.current?.scrollIntoView({ behavior: "smooth" });
    const delayTimeout = setTimeout(() => {
      setShowPreview(false);
      gameData.status = "Playing";
      if (
        gameData.score.round[0].left === 0 &&
        gameData.score.round[0].right === 0
      ) {
        gameData.timer = defineTimer(TIMER_START, "Start");
      } else {
        gameData.timer = defineTimer(TIMER_RESTART, "ReStart");
      }
    }, 2000);

    return () => {
      clearTimeout(delayTimeout);
    };
  }, []);

  useEffect(() => {
    pongRef.current?.scrollIntoView({ behavior: "smooth" });
    const delayTimeout = setTimeout(() => {
      setShowPreview(false);
      gameData.status = "Playing";
      if (
        gameData.score.round[0].left === 0 &&
        gameData.score.round[0].right === 0
      ) {
        gameData.timer = defineTimer(TIMER_START, "Start");
      } else {
        gameData.timer = defineTimer(TIMER_RESTART, "ReStart");
      }
    }, 1900);

    return () => {
      clearTimeout(delayTimeout);
    };
  }, []);

  useEffect(() => {
    if (gameData.status === "Finished") {
      setShowGameEnd(true);
      setShowPreview(false);
    }
  }, [gameData]);

  return (
    <div className={styles.pong} ref={pongRef}>
      <PongSoloHead
        profile={profile}
        gameData={gameData}
        trainingService={trainingService}
      />
      <div className={styles.canvasContainer}>
        {showPreview && <PlayerPreview gameData={gameData} />}
        {!showPreview && (
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
          />
        )}
        {showGameEnd && (
          <GameEnd
            gameData={gameData}
            isPlayer={gameData.hostSide}
            userId={profile.id}
          />
        )}
      </div>
      <Info gameData={gameData} setGameData={setGameData} />
    </div>
  );
}
