import { GameData } from "@transcendence/shared/types/Game.types";
import ScoreService from "@/services/Score.service";
import TrainingService from "@/services/Training.service";
import StatsService from "@/services/Stats.service";
import { ScoreUpdate } from "@transcendence/shared/types/Score.types";
import { PauseUpdate } from "@transcendence/shared/types/Pause.types";
import { StatsUpdate } from "@transcendence/shared/types/Stats.types";
import { AI_ID } from "@transcendence/shared/constants/Game.constants";
import { StoryUpdate } from "@transcendence/shared/types/Story.types";
import StoryService from "@/services/Story.service";

const scoreService = new ScoreService();
const trainingService = new TrainingService();
const statsService = new StatsService();
const storyService = new StoryService();

export async function updateDBScore(game: GameData) {
  try {
    const scoreUpdate: ScoreUpdate = {
      actualRound: game.actualRound,
      left: 0,
      right: 0,
      leftRound: game.score.leftRound,
      rightRound: game.score.rightRound,
    };
    if (
      game.actualRound > 0 &&
      game.score.round[game.actualRound].left === 0 &&
      game.score.round[game.actualRound].right === 0
    ) {
      scoreUpdate.actualRound--;
    }
    scoreUpdate.left = game.score.round[scoreUpdate.actualRound].left;
    scoreUpdate.right = game.score.round[scoreUpdate.actualRound].right;
    await scoreService.updateScore(game.id, scoreUpdate);
  } catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log(`Error Updating Score: ${error}`);
  }
}

export async function updateDBPause(game: GameData) {
  try {
    const pauseUpdate: PauseUpdate = {
      left: game.pause.left,
      right: game.pause.right,
    };
    await scoreService.updatePause(game.id, pauseUpdate);
  } catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log(`Error Updating Pause: ${error}`);
  }
}

export async function updateDBStatus(game: GameData) {
  try {
    const trainingUpdate: UpdateTrainingDTO = {
      status: game.status,
      result: game.result,
      actualRound: game.actualRound,
    };
    await trainingService.updateTraining(game.id, trainingUpdate);
  } catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log(`Error Updating Status: ${error}`);
  }
}

export async function updateDBStats(game: GameData) {
  try {
    const update: StatsUpdate = {
      type: game.type,
      mode: game.mode,
      side: game.playerLeft.id === AI_ID ? "Right" : "Left",
      winSide: game.winSide,
      score: game.score,
      nbRound: game.maxRound,
      maxPoint: game.maxPoint,
    };
    await statsService.updateStats(
      game.playerLeft.id === AI_ID ? game.playerRight.id : game.playerLeft.id,
      update
    );
  } catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log(`Error Updating Stats: ${error}`);
  }
}

export async function updateDBStory(game: GameData) {
  try {
    if (game.storyLevel === undefined) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("No story level defined");
      return;
    }
    const update: StoryUpdate = {
      level: game.storyLevel,
      completed: false,
    };
    if (
      (game.playerLeft.id === AI_ID &&
        game.score.rightRound > game.maxRound / 2) ||
      (game.playerRight.id === AI_ID &&
        game.score.leftRound > game.maxRound / 2)
    ) {
      update.completed = true;
    }
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log("update story", update, game);
    await storyService.updateStory(game.playerLeft.id, update);
  } catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log(`Error Updating Stats: ${error}`);
  }
}
