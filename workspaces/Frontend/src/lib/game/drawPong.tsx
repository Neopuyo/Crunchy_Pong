import {
  GameData,
  Player,
  Draw,
  PlayerDynamic,
  Timer,
} from "@transcendence/shared/types/Game.types";
import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  FONT_SCORE,
  GAME_WIDTH,
  GAME_HEIGHT,
  FONT_TIMER,
  FONT_ROUND,
  MAX_PAUSE,
  BALL_SIZE,
} from "@transcendence/shared/constants/Game.constants";
import {
  COLOR_MENU,
  COLOR_FONT,
  COLOR_ROUND_WON,
  COLOR_PAUSE,
  COLOR_FONT_DARK,
} from "@transcendence/shared/constants/Asset.constants";

function drawPlayer(draw: Draw, player: Player, playerDynamic: PlayerDynamic) {
  const radius = 8; // Adjust the radius to control the roundness of the corners

  const { r, g, b } = player.color;
  draw.context.fillStyle = `rgb(${r}, ${g}, ${b})`;

  draw.context.beginPath();
  draw.context.moveTo(playerDynamic.posX + radius, playerDynamic.posY);
  draw.context.lineTo(
    playerDynamic.posX + PLAYER_WIDTH - radius,
    playerDynamic.posY
  );
  draw.context.arcTo(
    playerDynamic.posX + PLAYER_WIDTH,
    playerDynamic.posY,
    playerDynamic.posX + PLAYER_WIDTH,
    playerDynamic.posY + radius,
    radius
  );
  draw.context.lineTo(
    playerDynamic.posX + PLAYER_WIDTH,
    playerDynamic.posY + PLAYER_HEIGHT - radius
  );
  draw.context.arcTo(
    playerDynamic.posX + PLAYER_WIDTH,
    playerDynamic.posY + PLAYER_HEIGHT,
    playerDynamic.posX + PLAYER_WIDTH - radius,
    playerDynamic.posY + PLAYER_HEIGHT,
    radius
  );
  draw.context.lineTo(
    playerDynamic.posX + radius,
    playerDynamic.posY + PLAYER_HEIGHT
  );
  draw.context.arcTo(
    playerDynamic.posX,
    playerDynamic.posY + PLAYER_HEIGHT,
    playerDynamic.posX,
    playerDynamic.posY + PLAYER_HEIGHT - radius,
    radius
  );
  draw.context.lineTo(playerDynamic.posX, playerDynamic.posY + radius);
  draw.context.arcTo(
    playerDynamic.posX,
    playerDynamic.posY,
    playerDynamic.posX + radius,
    playerDynamic.posY,
    radius
  );
  draw.context.closePath();

  draw.context.fill();
}

function drawBall(gameData: GameData, draw: Draw) {
  draw.context.drawImage(
    draw.ballImage,
    gameData.ball.posX,
    gameData.ball.posY,
    BALL_SIZE,
    BALL_SIZE
  );
}

function drawScore(draw: Draw, score: number, posX: number, posY: number) {
  draw.context.fillText(score.toString(), posX, posY);
}

function drawRound(draw: Draw, gameData: GameData, side: "Left" | "Right") {
  const {
    r: emptyR,
    g: emptyG,
    b: emptyB,
    a: emptyA,
  } = gameData.background === "Winter" ? COLOR_FONT_DARK : COLOR_FONT;
  const { r: wonR, g: wonG, b: wonB, a: wonA } = COLOR_ROUND_WON;
  const {
    r: borderR,
    g: borderG,
    b: borderB,
    a: borderA,
  } = gameData.background === "Winter" ? COLOR_FONT_DARK : COLOR_FONT;

  draw.context.fillStyle = `rgba(${wonR}, ${wonG}, ${wonB}, ${wonA})`;
  draw.context.strokeStyle = `rgba(${borderR}, ${borderG}, ${borderB}, ${borderA})`;
  draw.context.lineWidth = 5;

  const sign = side === "Left" ? -1 : 1;
  const rondWon =
    side === "Left" ? gameData.score.leftRound : gameData.score.rightRound;
  for (let i = 0; i < gameData.maxRound / 2; i++) {
    if (i >= rondWon)
      draw.context.fillStyle = `rgba(${emptyR}, ${emptyG}, ${emptyB}, ${emptyA})`;
    draw.context.beginPath();
    draw.context.arc(
      draw.canvas.width / 2 + 200 * sign + i * 50 * sign,
      55,
      16,
      0,
      Math.PI * 2
    );
    draw.context.fill();
    draw.context.stroke();
    draw.context.closePath();
  }
}

function drawPause(draw: Draw, gameData: GameData, side: "Left" | "Right") {
  const {
    r: emptyR,
    g: emptyG,
    b: emptyB,
    a: emptyA,
  } = gameData.background === "Winter" ? COLOR_FONT_DARK : COLOR_FONT;
  const { r: pauseR, g: pauseG, b: pauseB, a: pauseA } = COLOR_PAUSE;
  const {
    r: borderR,
    g: borderG,
    b: borderB,
    a: borderA,
  } = gameData.background === "Winter" ? COLOR_FONT_DARK : COLOR_FONT;

  draw.context.fillStyle = `rgba(${pauseR}, ${pauseG}, ${pauseB}, ${pauseA})`;
  draw.context.strokeStyle = `rgba(${borderR}, ${borderG}, ${borderB}, ${borderA})`;
  draw.context.lineWidth = 5;

  const sign = side === "Left" ? -1 : 1;
  const available =
    side === "Left" ? gameData.pause.left : gameData.pause.right;
  for (let i = MAX_PAUSE; i > 0; i--) {
    if (i <= available)
      draw.context.fillStyle = `rgba(${emptyR}, ${emptyG}, ${emptyB}, ${emptyA})`;
    draw.context.beginPath();
    draw.context.arc(
      draw.canvas.width / 2 + 900 * sign + i * 50 * sign,
      55,
      16,
      0,
      Math.PI * 2
    );
    draw.context.fill();
    draw.context.stroke();
    draw.context.closePath();
  }
}

function drawScoreTable(gameData: GameData, draw: Draw) {
  // Set font
  const { r, g, b, a } =
    gameData.background === "Winter" ? COLOR_FONT_DARK : COLOR_FONT;
  draw.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  draw.context.font = FONT_SCORE;
  draw.context.textAlign = "center";
  let actualRound = gameData.actualRound;
  if (actualRound > gameData.maxRound) {
    if (
      process.env &&
      process.env.ENVIRONNEMENT &&
      process.env.ENVIRONNEMENT === "dev"
    )
      console.log("actualRound", actualRound);
    actualRound--;
  }

  // Draw Score
  drawScore(
    draw,
    gameData.score.round[
      actualRound === gameData.maxRound ? actualRound - 1 : actualRound
    ].left,
    draw.canvas.width / 4,
    85
  );
  drawScore(
    draw,
    gameData.score.round[
      actualRound === gameData.maxRound ? actualRound - 1 : actualRound
    ].right,
    draw.canvas.width / 4 + draw.canvas.width / 2,
    85
  );

  // Draw actual round
  if (gameData.maxRound > 1) {
    draw.context.font = FONT_ROUND;
    draw.context.fillText("Round " + actualRound, draw.canvas.width / 2, 75);
  }

  // Draw player round won
  drawRound(draw, gameData, "Left");
  drawRound(draw, gameData, "Right");

  // Draw pause
  if (gameData.pause.active) {
    drawPause(draw, gameData, "Left");
    drawPause(draw, gameData, "Right");
  }
}

function applyBlurEffect(draw: Draw) {
  const { r, g, b, a } = COLOR_MENU;
  draw.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  draw.context.fillRect(0, 0, draw.canvas.width, draw.canvas.height);
}

function drawTimer(
  timer: Timer,
  draw: Draw,
  round: number,
  background: string
) {
  // remove 2h from the timer
  const actualTime = new Date().getTime();

  if (actualTime <= timer.end) {
    applyBlurEffect(draw);
    const { r, g, b, a } =
      background === "Winter" ? COLOR_FONT_DARK : COLOR_FONT;
    draw.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    draw.context.font = FONT_TIMER;
    draw.context.textAlign = "center";
    //define the time difference between both dates
    const timerDif = timer.end - actualTime;
    const showTimer = Math.floor(timerDif / 1000);

    // Draw timer reason
    let reason: string = timer.reason;
    if (timer.reason === "Pause") {
      reason = `${timer.playerName} as requested a Pause`;
    } else if (timer.reason === "Deconnection") {
      reason = `${timer.playerName} has been disconnected`;
    } else if (timer.reason === "Round") {
      reason = `Round ${round} is starting`;
    } else if (timer.reason === "Start") {
      reason = `Game is starting`;
    } else if (timer.reason === "Serve") {
      reason = `${timer.playerName} will serve`;
    } else if (timer.reason === "ReStart") {
      reason = `Prepare for Restart`;
    }
    draw.context.fillText(
      reason,
      draw.canvas.width / 2,
      draw.canvas.height / 2 - 40
    );

    // Draw timer
    if (showTimer > 0) {
      draw.context.fillText(
        showTimer.toString() + "s",
        draw.canvas.width / 2,
        draw.canvas.height / 2 + 70
      );
    } else if (
      showTimer === 0 &&
      timer.reason !== "Deconnection" &&
      timer.reason !== "Pause"
    ) {
      draw.context.fillText(
        "GO!",
        draw.canvas.width / 2,
        draw.canvas.height / 2 + 70
      );
    }
  }
}

export function drawPong(gameData: GameData, draw: Draw) {
  // Clear the Canvas
  draw.context.clearRect(0, 0, draw.canvas.width, draw.canvas.height);
  // Draw the background image
  draw.context.drawImage(draw.backgroundImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Draw the Player
  drawPlayer(draw, gameData.playerLeft, gameData.playerLeftDynamic);
  drawPlayer(draw, gameData.playerRight, gameData.playerRightDynamic);

  // Draw the Score
  drawScoreTable(gameData, draw);

  // Draw the ball
  if (gameData.status === "Playing") drawBall(gameData, draw);

  // Draw the Timer
  drawTimer(
    gameData.timer,
    draw,
    gameData.actualRound + 1,
    gameData.background
  );
}
