import { drawPong } from "./drawPong";
import { GameData, Draw, Player } from "@transcendence/shared/types/Game.types";

import {
  UpdateData,
  StatusMessage,
  ScoreMessage,
} from "@transcendence/shared/types/Message.types";

import { FRONT_FPS } from "@transcendence/shared/constants/Game.constants";

const lastTimestampRef = { current: 0 };
const lastFpsUpdateTimeRef = { current: 0 };
const frameCountRef = { current: 0 };
const fpsRef = { current: 0 };
const showFpsRef = false;

const updateMessage: UpdateData[] = [];
const playerMessage: Player[] = [];
const statusMessage: StatusMessage[] = [];
const scoreMessage: ScoreMessage[] = [];

export const addUpdateMessage = (updateData: UpdateData) => {
  //replace the last update message
  if (updateMessage.length > 0) {
    updateMessage.pop();
  }
  updateMessage.push(updateData);
};

export const addPlayerMessage = (playerData: Player) => {
  if (playerMessage.length > 0) {
    playerMessage.pop();
  }
  playerMessage.push(playerData);
};

export const addStatusMessage = (statusData: StatusMessage) => {
  if (statusMessage.length > 0) {
    statusMessage.pop();
  }
  statusMessage.push(statusData);
};

export const addScoreMessage = (scoreData: ScoreMessage) => {
  if (scoreMessage.length > 0) {
    scoreMessage.pop();
  }
  scoreMessage.push(scoreData);
};

const updateGame = (game: GameData) => {
  if (updateMessage.length > 0) {
    const updateData = updateMessage.shift()!;
    const newGameData = { ...game };
    newGameData.playerLeftDynamic = updateData.playerLeftDynamic;
    newGameData.playerRightDynamic = updateData.playerRightDynamic;
    newGameData.ball = updateData.ball;
    game = newGameData;
  }
  if (playerMessage.length > 0) {
    const playerData = playerMessage.shift()!;
    const newGameData = { ...game };
    if (playerData.side === "Left") {
      newGameData.playerLeft = playerData;
    } else if (playerData.side === "Right") {
      newGameData.playerRight = playerData;
    }
    game = newGameData;
  }
  if (statusMessage.length > 0) {
    const statusData = statusMessage.shift()!;
    const newGameData = { ...game };
    newGameData.status = statusData.status;
    newGameData.result = statusData.result;
    newGameData.winSide = statusData.winSide;
    newGameData.playerLeftStatus = statusData.playerLeft;
    newGameData.playerRightStatus = statusData.playerRight;
    newGameData.timer = statusData.timer;
    newGameData.pause = statusData.pause;
    game = newGameData;
  }
  if (scoreMessage.length > 0) {
    const scoreData = scoreMessage.shift()!;
    const newGameData = { ...game };
    newGameData.score = scoreData.score;
    newGameData.actualRound = scoreData.actualRound;
    game = newGameData;
  }
  return game;
};

export const gameLoop = (
  timestamp: number,
  game: GameData,
  draw: Draw,
  isMountedRef: React.MutableRefObject<boolean>
) => {
  if (!isMountedRef.current) return;
  const elapsedTime = timestamp - lastTimestampRef.current;
  frameCountRef.current++;
  if (elapsedTime >= 16.67) {
    game = updateGame(game);
    drawPong(game, draw);

    lastTimestampRef.current = timestamp;
  }

  const currentTime = performance.now();
  const elapsedFpsTime = currentTime - lastFpsUpdateTimeRef.current;

  if (elapsedFpsTime >= 1000) {
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
      gameLoop(timestamp, game, draw, isMountedRef)
    );
  }, remainingDelay);
};
