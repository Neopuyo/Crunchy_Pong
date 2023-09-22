import fetchData from "@/lib/fetch/fetchData";

export default class MatchmakingService {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  //Mets le joueur dans la file d'attente
  public async startSearch(type: "Classic" | "Best3" | "Best5"): Promise<any> {
    try {
      const body = JSON.stringify({ type });
      const response = await fetchData(
        this.token,
        "matchmaking",
        "start",
        "PUT",
        body
      );
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Sors le joueur de la file d'attente
  public async stopSearch(userId: number): Promise<any> {
    try {
      const response = await fetchData(this.token, "matchmaking", `stop/${userId}`, "PUT");
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Demande si le joueur à trouvé une game
  public async checkSearch(): Promise<any> {
    try {
      const response = await fetchData(this.token, "matchmaking", "check", "GET");
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }
}
