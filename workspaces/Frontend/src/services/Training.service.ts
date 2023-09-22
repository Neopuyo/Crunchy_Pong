import fetchData from "@/lib/fetch/fetchData";

export default class TrainingService {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  //Creer la game
  public async createTraining(
    training: CreateTrainingDTO
  ): Promise<ReturnData> {
    try {
      const body = JSON.stringify(training);
      const response = await fetchData(
        this.token,
        "training",
        "create",
        "POST",
        body
      );
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Recupere la liste des game en cours
  public async getTrainingData(id: string): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "training",
        `get/${id}`,
        "GET"
      );
      const data: ReturnData = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Recupere l'etat du joueur ( in training or not )
  public async isInTraining(): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "training",
        "isInTraining",
        "GET"
      );
      const data = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async updateTraining(
    id: string,
    update: UpdateTrainingDTO
  ): Promise<ReturnData> {
    try {
      const body = JSON.stringify(update);
      const response = await fetchData(
        this.token,
        "training",
        `update/${id}`,
        "PUT",
        body
      );
      const data: ReturnData = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  //Quit la partie en cours
  public async quitTraining(id: string): Promise<ReturnData> {
    try {
      const response = await fetchData(
        this.token,
        "training",
        `quit/${id}`,
        "POST"
      );
      const data: ReturnData = await response.json();
      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }
}
