// handle random background and ball
import {
  BACKGROUND,
  BALL,
} from "@transcendence/shared/constants/Asset.constants";

export function confirmBackground(background: string) {
  if (background === "Random") {
    const randomBackgroundIndex = Math.floor(
      Math.random() * (BACKGROUND.length - 1)
    );
    background = BACKGROUND[randomBackgroundIndex];
  }
  return background;
}

export function confirmBall(ball: string) {
  if (ball === "Random") {
    const randomBallIndex = Math.floor(Math.random() * (BALL.length - 1));
    ball = BALL[randomBallIndex];
  }
  return ball;
}

export function randomMaxPoint(): 3 | 5 | 7 | 9 {
  const random = Math.floor(Math.random() * 4);
  if (random === 0) {
    return 3;
  } else if (random === 1) {
    return 5;
  } else if (random === 2) {
    return 7;
  } else {
    return 9;
  }
}

export function randomMaxRound(): 1 | 3 | 5 | 7 | 9 {
  const random = Math.floor(Math.random() * 5);
  if (random === 0) {
    return 1;
  } else if (random === 1) {
    return 3;
  } else if (random === 2) {
    return 5;
  } else if (random === 3) {
    return 7;
  } else {
    return 9;
  }
}
