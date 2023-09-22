import fetchData from "@/lib/fetch/fetchData";

export default class AchievementService {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  //Recupere la liste des achievements de l'utilisateur
  public async getAllAchievement(userId: number): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "achievement",
        `getAll/${userId}`,
        "GET"
      );
      const data: ReturnData = await response.json();
      return data;
    } catch (error: any) {
      if (error.message === "disconnect") throw new Error("disconnect");
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(`Error Getting User achievement: ${error}`);
      return {
        success: false,
        message: "Error Getting User achievement",
      };
    }
  }

  //Recupere les derniers achievements de l'utilisateur jusqu'a 3 (peut etre null)
  public async getLast(userId: number): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "achievement",
        `getLast/${userId}`,
        "GET"
      );
      const data: ReturnData = await response.json();
      return data;
    } catch (error: any) {
      if (error.message === "disconnect") throw new Error("disconnect");
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(`Error Getting User achievement: ${error}`);
      return {
        success: false,
        message: "Error Getting User achievement",
      };
    }
  }

  public async collectAchievement(
    userId: number,
    achievementId: string
  ): Promise<void> {
    try {
      await fetchData(
        this.token,
        "achievement",
        `collected/${userId}/${achievementId}`,
        "PUT"
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
