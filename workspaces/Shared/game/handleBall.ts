import {
  DirXValues,
  DirYValues,
  GameData,
  Ball,
  PlayerDynamic,
} from "@transcendence/shared/types/Game.types";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  BALL_SIZE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
} from "@transcendence/shared/constants/Game.constants";

export function resetBall(ball: Ball, game: GameData): void {
  ball.posX = GAME_WIDTH / 2;
  ball.posY = GAME_HEIGHT / 2;
  ball.moveX = DirXValues.Idle;
  ball.moveY = DirYValues.Idle;
  while (ball.push > 0) {
    ball.push--;
    ball.speed -= 1;
  }
}

export function handlePush(ball: Ball, player: PlayerDynamic): void {
  if (player.push > 0 && player.push <= 5) {
    ball.push++;
    ball.speed += 1;
  } else if (ball.push > 0) {
    ball.push--;
    ball.speed -= 1;
  }
}

export function calculateBallAngle(
  ball: Ball,
  posY: number,
  height: number
): number {
  const relativeIntersectY = posY + height / 2 - (ball.posY + BALL_SIZE / 2);
  const normalIntersectY = relativeIntersectY / (height / 2);
  const bounceAngle = normalIntersectY * 45;
  return bounceAngle * (Math.PI / 180);
}

export function handlePlayerCollision(
  ball: Ball,
  player: PlayerDynamic,
  playerSide: "Left" | "Right"
): void {
  const margin = ball.speed * 1.5;
  if (
    (playerSide === "Left" &&
      ball.posX >= player.posX + PLAYER_WIDTH - margin / 2 &&
      ball.posX <= player.posX + PLAYER_WIDTH + margin / 2) ||
    (playerSide === "Right" &&
      ball.posX + BALL_SIZE >= player.posX - margin / 2 &&
      ball.posX + BALL_SIZE <= player.posX + margin / 2)
  ) {
    if (
      ball.posY + BALL_SIZE >= player.posY &&
      ball.posY <= player.posY + PLAYER_HEIGHT
    ) {
      const newAngle = calculateBallAngle(ball, player.posY, PLAYER_HEIGHT);
      const newMoveX = Math.cos(newAngle);
      if (Math.sign(ball.moveX) === Math.sign(newMoveX)) {
        ball.moveX = -1 * newMoveX;
      } else {
        ball.moveX = newMoveX;
      }
      ball.moveY = -Math.sin(newAngle);
      handlePush(ball, player);
    }
  }
}

export function updateBall(ball: Ball, game: GameData): string {
  // Handle Player collisions
  if (ball.moveX < DirXValues.Idle) {
    handlePlayerCollision(ball, game.playerLeftDynamic, "Left");
  } else if (ball.moveX > DirXValues.Idle) {
    handlePlayerCollision(ball, game.playerRightDynamic, "Right");
  }

  // Move ball in intended direction based on moveY and moveX values
  ball.posY += ball.moveY * ball.speed;
  ball.posX += ball.moveX * ball.speed;

  // Handle Wall collisions
  if (ball.posX <= 0) {
    return "reset Left";
  } else if (ball.posX >= GAME_WIDTH - BALL_SIZE) {
    return "reset Right";
  }
  if (ball.posY <= 0) {
    ball.moveY *= -1;
    ball.posY = 1;
  } else if (ball.posY >= GAME_HEIGHT - BALL_SIZE) {
    ball.moveY *= -1;
    ball.posY = GAME_HEIGHT - BALL_SIZE - 1;
  }
  return "Ball updated";
}

export function handleServe(ball: Ball, game: GameData): void {
  // Determine the vertical direction of the serve
  ball.moveX = game.playerServe === "Left" ? DirXValues.Right : DirXValues.Left;
  if (Math.random() < 0.5) {
    ball.moveY = DirYValues.Up;
  } else {
    ball.moveY = DirYValues.Down;
  }
  var newAngle = 1;
  var newMoveX = 1;
  while (
    !(
      (0.2 < newAngle && newAngle < 0.3) ||
      (-0.3 < newAngle && newAngle < -0.2)
    )
  ) {
    var pos = Math.random() * (GAME_HEIGHT / 2 - BALL_SIZE);
    if (Math.random() < 0.5) pos *= -1;
    newAngle = calculateBallAngle(ball, pos, GAME_HEIGHT);
    newMoveX = Math.cos(newAngle);
  }

  // Calculate the new moveX and moveY based on the angle
  if (Math.sign(ball.moveX) === Math.sign(newMoveX)) {
    ball.moveX = -1 * newMoveX;
  } else {
    ball.moveX = newMoveX;
  }
  ball.moveY = -Math.sin(newAngle);
  game.playerServe = null;
  game.sendStatus = true;
}
