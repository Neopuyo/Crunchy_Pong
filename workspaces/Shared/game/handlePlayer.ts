import {
  GameData,
  Ball,
  Player,
  PlayerDynamic,
  DirXValues,
} from "@transcendence/shared/types/Game.types";

import {
  GAME_HEIGHT,
  BALL_SIZE,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PUSH_SIZE,
} from "@transcendence/shared/constants/Game.constants";

export function handlePush(player: Player, playerDynamic: PlayerDynamic): void {
  if (playerDynamic.push > 0 && playerDynamic.push <= PUSH_SIZE / 2) {
    playerDynamic.push++;
    playerDynamic.posX += player.side === "Left" ? 5 : -5;
  } else if (
    playerDynamic.push > PUSH_SIZE / 2 &&
    playerDynamic.push <= PUSH_SIZE
  ) {
    playerDynamic.push++;
    playerDynamic.posX += player.side === "Left" ? -5 : 5;
    if (playerDynamic.push === PUSH_SIZE + 1) {
      playerDynamic.push = 0;
    }
  }
}

export function updatePlayer(
  player: Player,
  playerDynamic: PlayerDynamic
): void {
  if (playerDynamic.move === "Up") {
    playerDynamic.posY -= playerDynamic.speed;
  } else if (playerDynamic.move === "Down") {
    playerDynamic.posY += playerDynamic.speed;
  }

  // Limit player position within the game height
  playerDynamic.posY = Math.max(
    0,
    Math.min(GAME_HEIGHT - PLAYER_HEIGHT, playerDynamic.posY)
  );
  handlePush(player, playerDynamic);
}

export function moveAI(
  game: GameData,
  player: Player,
  playerDynamic: PlayerDynamic,
  Ball: Ball
): void {
  if (
    game.timer.reason !== "Serve" &&
    game.timer.reason !== "Round" &&
    game.timer.end > new Date().getTime()
  )
    return;

  if (
    (game.timer.reason === "Serve" || game.timer.reason === "Round") &&
    game.timer.end > new Date().getTime()
  ) {
    // Move the player's paddle gradually towards the center of the court
    if (
      playerDynamic.posY >
      GAME_HEIGHT / 2 - PLAYER_HEIGHT / 2 + playerDynamic.speed / 2
    ) {
      playerDynamic.posY -= Math.min(
        playerDynamic.speed / 2,
        playerDynamic.posY
      );
    } else if (
      playerDynamic.posY <
      GAME_HEIGHT / 2 - PLAYER_HEIGHT / 2 - playerDynamic.speed / 2
    ) {
      playerDynamic.posY += Math.min(
        playerDynamic.speed / 2,
        GAME_HEIGHT - PLAYER_HEIGHT - playerDynamic.posY
      );
    }
    return;
  } else {
    // Estimate when the ball will cross the AI's side of the court
    const timeToReachAI = Math.abs(
      (playerDynamic.posX - Ball.posX) / Ball.moveX
    );
    const predictedBallPosY = Ball.posY + Ball.moveY * timeToReachAI;

    // Calculate the target position considering the predicted ball position
    const targetYWithPrediction = predictedBallPosY - PLAYER_HEIGHT / 2;

    // Calculate the distance between the current position and target position
    const distanceToTarget = Math.abs(
      playerDynamic.posY - targetYWithPrediction
    );

    // Calculate a variable movement speed based on the distance and on the direction of the ball
    const maxSpeed = playerDynamic.speed * 1.2;
    const minSpeed = playerDynamic.speed / 3;
    let movementSpeed =
      minSpeed +
      ((maxSpeed - minSpeed) * distanceToTarget) /
        (GAME_HEIGHT - PLAYER_HEIGHT);
    if (movementSpeed > maxSpeed) movementSpeed = maxSpeed;

    if (playerDynamic.posY > targetYWithPrediction + PLAYER_HEIGHT / 3) {
      playerDynamic.posY -= movementSpeed;
    } else if (playerDynamic.posY < targetYWithPrediction - PLAYER_HEIGHT / 3) {
      playerDynamic.posY += movementSpeed;
    }

    // Handle Push
    if (game.push) {
      const ballNearPlayerPaddle =
        Ball.posX - BALL_SIZE <= playerDynamic.posX + PLAYER_WIDTH &&
        Ball.posX + BALL_SIZE * 2 >= playerDynamic.posX &&
        Ball.posY + BALL_SIZE >= playerDynamic.posY &&
        Ball.posY <= playerDynamic.posY + PLAYER_HEIGHT;
      if (
        ballNearPlayerPaddle &&
        playerDynamic.push === 0 &&
        Math.random() > 0.33
      ) {
        playerDynamic.push = 1;
      }
      handlePush(player, playerDynamic);
    }
  }

  // Limit playerDynamic position within the game height
  playerDynamic.posY = Math.max(
    0,
    Math.min(GAME_HEIGHT - PLAYER_HEIGHT, playerDynamic.posY)
  );
}
