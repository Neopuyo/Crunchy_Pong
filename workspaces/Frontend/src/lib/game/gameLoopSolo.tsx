import { drawPong } from "./drawPong";
import { GameData, Draw } from "@transcendence/shared/types/Game.types";
import { defineTimer } from "@transcendence/shared/game/pongUtils";
import {
  TIMER_RESTART,
  TIMER_PAUSE,
  FRONT_FPS,
  BACK_FPS,
} from "@transcendence/shared/constants/Game.constants";
import { updatePong } from "@transcendence/shared/game/updatePong";
import {
  updateDBScore,
  updateDBStatus,
  updateDBStats,
  updateDBPause,
  updateDBStory,
} from "./updateDB";

const lastTimestampRef = { current: 0 };
const lastFpsUpdateTimeRef = { current: 0 };
const frameCountRef = { current: 0 };
const fpsRef = { current: 0 };
const showFpsRef = false;
let gameLoopRunning = true;
let pauseLoopRunning: "Left" | "Right" | null = null;

function pauseCheck(side: "Left" | "Right", gameData: GameData) {
  const actualTime = new Date().getTime();
  if (actualTime >= gameData.timer.end) {
    gameData.status = "Playing";
    gameData.timer = defineTimer(
      TIMER_RESTART,
      "ReStart",
      side === "Left" ? gameData.playerLeft.name : gameData.playerRight.name
    );
    gameData.sendStatus = true;
    pauseLoopRunning = null;
  }
}

export function startPause(side: "Left" | "Right", gameData: GameData) {
  if (!pauseLoopRunning) {
    gameData.status = "Stopped";
    gameData.sendStatus = true;
    gameData.updatePause = true;
    gameData.timer = defineTimer(
      TIMER_PAUSE,
      "Pause",
      side === "Left" ? gameData.playerLeft.name : gameData.playerRight.name
    );
    pauseLoopRunning = side;
  }
}

export function stopPause(side: "Left" | "Right", gameData: GameData) {
  gameData.status = "Playing";
  gameData.sendStatus = true;
  gameData.timer = defineTimer(
    TIMER_RESTART,
    "ReStart",
    side === "Left" ? gameData.playerLeft.name : gameData.playerRight.name
  );
  pauseLoopRunning = null;
}

export const gameLoop = (
  timestamp: number,
  game: GameData,
  setGameData: Function,
  draw: Draw,
  isMountedRef: React.MutableRefObject<boolean>,
  demo: boolean
) => {
  if (!isMountedRef.current || !gameLoopRunning) return;
  const elapsedTime = timestamp - lastTimestampRef.current;
  frameCountRef.current++;
  const updatedGame = { ...game };
  if (elapsedTime >= BACK_FPS) {
    if (updatedGame.status === "Playing") {
      updatePong(updatedGame);
      if (updatedGame.updateScore) {
        if (!demo) updateDBScore(updatedGame);
        updatedGame.updateScore = false;
      }
    }
    if (pauseLoopRunning) {
      pauseCheck(pauseLoopRunning, updatedGame);
    }
    if (updatedGame.sendStatus) {
      if (!demo) updateDBStatus(updatedGame);
      updatedGame.sendStatus = false;
      if (updatedGame.status === "Finished") {
        gameLoopRunning = false;
        if (!demo) updateDBStats(updatedGame);
        if (updatedGame.type === "Story") {
          if (!demo) updateDBStory(updatedGame);
        }
      }
    }
    if (updatedGame.updatePause) {
      if (!demo) updateDBPause(updatedGame);
      updatedGame.updatePause = false;
    }
    drawPong(updatedGame, draw);
    lastTimestampRef.current = timestamp;
  }

  const currentTime = performance.now();
  const elapsedFpsTime = currentTime - lastFpsUpdateTimeRef.current;

  if (elapsedFpsTime >= 1000) {
    // Calculate FPS
    fpsRef.current = Math.round(
      (frameCountRef.current * 1000) / elapsedFpsTime
    );

    // Display FPS
    if (
      process.env &&
      process.env.ENVIRONNEMENT &&
      process.env.ENVIRONNEMENT === "dev" &&
      showFpsRef
    )
      console.log("FPS:", fpsRef.current);

    frameCountRef.current = 0;
    lastFpsUpdateTimeRef.current = currentTime;
  }

  const remainingDelay = Math.max(
    FRONT_FPS - (performance.now() - timestamp),
    0
  );
  setTimeout(() => {
    requestAnimationFrame((timestamp) =>
      gameLoop(timestamp, updatedGame, setGameData, draw, isMountedRef, demo)
    );
  }, remainingDelay);
  setGameData(updatedGame);
};
