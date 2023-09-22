import fetchData from "@/lib/fetch/fetchData";
export default class LobbyService {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  //Creer la game
  public async createGame(gameData: GameDTO): Promise<ReturnData> {
    try {
      const body = JSON.stringify(gameData);
      const response = await fetchData(
        this.token,
        "lobby",
        "create",
        "POST",
        body
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Recupere l'etat du joueur ( in game or not )
  public async userInGame(): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "lobby",
        `userInGame`,
        "GET"
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Recupere l'etat du joueur ( in game or not )
  public async otherInGame(userId: number): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "lobby",
        `otherInGame/${userId}`,
        "GET"
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async ongoingInvite(inviterId: number): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "lobby",
        `ongoingInvite/${inviterId}`,
        "GET"
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Recupere la liste des game en cours
  public async getCurrentGame(mode?: "League" | "Party"): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "lobby",
        mode ? `getCurrentGame/${mode}` : "getCurrentGame",
        "GET"
      );
      const data: ReturnData = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Get leaderboard data
  public async getLeaderboard(): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "lobby",
        "getLeaderboard",
        "GET"
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async joinGame(gameId: string): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "lobby",
        `join/${gameId}`,
        "PUT"
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Quit la partie en cours
  public async quitGame(): Promise<void> {
    try {
      await fetchData(this.token, "lobby", "quit", "POST");
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
