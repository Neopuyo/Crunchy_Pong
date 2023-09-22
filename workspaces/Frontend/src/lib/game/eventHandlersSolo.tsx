import { Action, GameData } from "@transcendence/shared/types/Game.types";
import { ActionSolo } from "@transcendence/shared/types/Message.types";
import { startPause, stopPause } from "./gameLoopSolo";
import { profile } from "console";

export const pongKeyDown = (
  profile: Profile,
  event: KeyboardEvent,
  gameData: GameData,
  isPlayer: "Left" | "Right" | ""
) => {
  if (gameData.status === "Playing") {
    // handle player move Up
    if (
      (profile.gameKey === "Arrow" && event.key === "ArrowUp") ||
      (profile.gameKey === "ZQSD" &&
        (event.key === "z" || event.key === "Z")) ||
      (profile.gameKey === "WASD" && (event.key === "w" || event.key === "W"))
    ) {
      event.preventDefault();
      if (isPlayer === "Left" && gameData.playerLeftDynamic.move !== "Up") {
        gameData.playerLeftDynamic.move = Action.Up;
      } else if (
        isPlayer === "Right" &&
        gameData.playerRightDynamic.move !== "Up"
      ) {
        gameData.playerRightDynamic.move = Action.Up;
      }

      // handle player move Down
    } else if (
      (profile.gameKey === "Arrow" && event.key === "ArrowDown") ||
      (profile.gameKey === "ZQSD" &&
        (event.key === "s" || event.key === "S")) ||
      (profile.gameKey === "WASD" && (event.key === "s" || event.key === "S"))
    ) {
      const action: ActionSolo = {
        action: Action.Down,
        side: "",
      };
      event.preventDefault();
      if (
        isPlayer === "Left" &&
        gameData.playerLeftDynamic.move !== Action.Down
      ) {
        gameData.playerLeftDynamic.move = Action.Down;
      } else if (
        isPlayer === "Right" &&
        gameData.playerRightDynamic.move !== Action.Down
      ) {
        gameData.playerRightDynamic.move = Action.Down;
      }

      // handle player push
    } else if (event.key === " ") {
      event.preventDefault();
      if (gameData.push) {
        if (isPlayer === "Left" && gameData.playerLeftDynamic.push === 0) {
          gameData.playerLeftDynamic.push = 1;
        } else if (
          isPlayer === "Right" &&
          gameData.playerRightDynamic.push === 0
        ) {
          gameData.playerRightDynamic.push = 1;
        }
      }
    }
  }

  // handle player start/stop
  if (event.key === "Enter") {
    event.preventDefault();
    if (gameData.status === "Playing" && gameData.pause.active) {
      // Check if player is allowed to pause
      if (isPlayer === "Left" && gameData.pause.left) {
        gameData.pause.left--;
        gameData.pause.status = "Left";
      } else if (isPlayer === "Right" && gameData.pause.right) {
        gameData.pause.right--;
        gameData.pause.status = "Right";
      } else return;
      // Pause the game
      startPause(isPlayer === "Left" ? "Left" : "Right", gameData);
    } else if (gameData.status === "Stopped" && gameData.pause.active) {
      // Check if player is allowed to restart
      if (
        (isPlayer === "Left" && gameData.pause.status === "Right") ||
        (isPlayer === "Right" && gameData.pause.status === "Left")
      ) {
        return;
      }
      // Restart the game
      stopPause(isPlayer === "Left" ? "Left" : "Right", gameData);
    }
  }
};

export const pongKeyUp = (
  gameData: GameData,
  isPlayer: "Left" | "Right" | ""
) => {
  if (isPlayer === "Left" && gameData.playerLeftDynamic.move !== Action.Idle) {
    gameData.playerLeftDynamic.move = Action.Idle;
  } else if (
    isPlayer === "Right" &&
    gameData.playerRightDynamic.move !== Action.Idle
  ) {
    gameData.playerRightDynamic.move = Action.Idle;
  }
};
