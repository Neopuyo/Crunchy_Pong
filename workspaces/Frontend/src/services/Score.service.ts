import {
  ScoreInfo,
  ScoreUpdate,
} from "@transcendence/shared/types/Score.types";
import fetchData from "@/lib/fetch/fetchData";
import { PauseUpdate } from "@transcendence/shared/types/Pause.types";

export default class ScoreService {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  //Recupere l'etat du joueur ( in game or not )
  public async getScoreByGameId(gameId: string): Promise<ScoreInfo> {
    try {
      const response = await fetchData(
        this.token,
        "score",
        `game/${gameId}`,
        "GET"
      );
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async updateScore(gameId: string, update: ScoreUpdate): Promise<void> {
    try {
      const body = JSON.stringify(update);
      await fetchData(
        this.token,
        "score",
        `update/${gameId}`,
        "PUT",
        body
      );
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async updatePause(gameId: string, update: PauseUpdate): Promise<void> {
    try {
      const body = JSON.stringify(update);
      await fetchData(this.token, "score", `updatePause/${gameId}`, "PUT", body);
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }
}
