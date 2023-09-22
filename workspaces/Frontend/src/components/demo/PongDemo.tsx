"use client";
// Import des composants react
import { useRef, useEffect, useMemo, useState } from "react";

// Import du style
import styles from "@/styles/demo/PongDemo.module.css";

// Import des composants
import Info from "@/components/game/Info";

// Import GameLogic
import { gameLoop } from "@/lib/game/gameLoopSolo";
import { GameData, Draw } from "@transcendence/shared/types/Game.types";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "@transcendence/shared/constants/Game.constants";
import { defineTimer } from "@transcendence/shared/game/pongUtils";
import PongDemoHead from "./PongDemoHead";
import PlayerPreview from "@/components/game/PlayerPreview";

type Props = {
  userId: number | undefined;
  gameData: GameData;
  setGameData: Function;
  setShowDemo: Function;
  scrollTop: boolean;
};

export default function PongDemo({
  userId,
  gameData,
  setGameData,
  setShowDemo,
  scrollTop = true,
}: Props) {
  const pongRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMountedRef = useRef(true);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(true);

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
        gameLoop(timestamp, gameData, setGameData, draw, isMountedRef, true)
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
    if (scrollTop) pongRef.current?.scrollIntoView({ behavior: "smooth" });
    const delayTimeout = setTimeout(() => {
      setShowPreview(false);
      gameData.status = "Playing";
      gameData.timer = defineTimer(1, "Start");
    }, 2000);

    return () => {
      clearTimeout(delayTimeout);
    };
  }, []);

  return (
    <div className={userId === undefined ? styles.pong : ""} ref={pongRef}>
      <PongDemoHead
        userId={userId}
        gameData={gameData}
        setShowDemo={setShowDemo}
      />
      <div className={styles.canvasContainer}>
        {!showPreview && (
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
          />
        )}
        {showPreview && <PlayerPreview gameData={gameData} />}
      </div>
      <Info gameData={gameData} setGameData={setGameData} />
    </div>
  );
}
