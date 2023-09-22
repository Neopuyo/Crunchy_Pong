import React, { useEffect, useRef } from "react";
import AvatarUser from "../avatarUser/AvatarUser";
import { GameData } from "@transcendence/shared/types/Game.types";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "@transcendence/shared/constants/Game.constants";
import styles from "@/styles/game/PlayerPreview.module.css";

type Props = {
  gameData: GameData;
};

export default function PlayerPreview({ gameData }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d");

    // Draw the gradient background
    if (!context) return;
    const gradient = context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    let { r, g, b } = gameData.playerLeft.color;
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    ({ r, g, b } = gameData.playerRight.color);
    gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [gameData]);

  return (
    <div className={styles.playerPreview}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
      />
      <div className={styles.leftPlayer}>
        <div className={styles.avatar}>
          <AvatarUser
            avatar={gameData.playerLeft.avatar}
            borderSize={"3px"}
            backgroundColor={gameData.playerLeft.avatar.backgroundColor}
            borderColor={gameData.playerLeft.avatar.borderColor}
            fontSize="3rem"
          />
        </div>
        <h3 className={styles.playerName}>{gameData.playerLeft.name}</h3>
      </div>
      <h2 className={styles.vs}>VS</h2>
      <div className={styles.rightPlayer}>
        <div className={styles.avatar}>
          <AvatarUser
            avatar={gameData.playerRight.avatar}
            borderSize={"3px"}
            backgroundColor={gameData.playerRight.avatar.backgroundColor}
            borderColor={gameData.playerRight.avatar.borderColor}
            fontSize="3rem"
          />
        </div>
        <h3 className={styles.playerName}>{gameData.playerRight.name}</h3>
      </div>
    </div>
  );
}
