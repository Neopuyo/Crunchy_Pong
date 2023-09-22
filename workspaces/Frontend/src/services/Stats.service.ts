import fetchData from "@/lib/fetch/fetchData";
import {
  ShortStats,
  StatsImproved,
  StatsUpdate,
  UserLevel,
} from "@transcendence/shared/types/Stats.types";

export default class StatsService {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  public async getShortStats(
    userId: number
  ): Promise<ReturnDataTyped<ShortStats>> {
    const rep: ReturnDataTyped<ShortStats> = {
      success: false,
      message: "",
    };

    try {
      const response = await fetchData(
        this.token,
        "stats",
        `getShort/${userId}`,
        "GET"
      );

      if (!response.ok)
        throw new Error(`fetching Short stats of user[${userId}] impossible`);

      const repStats = await response.json();
      if (!repStats.success) throw new Error(repStats.messsage);

      rep.data = repStats.data;
      rep.success = true;
    } catch (error: any) {
      throw new Error(error.message);
    }

    return rep;
  }

  public async getFullStats(
    userId: number
  ): Promise<ReturnDataTyped<StatsImproved>> {
    const rep: ReturnDataTyped<StatsImproved> = {
      success: false,
      message: "",
    };

    try {
      const response = await fetchData(
        this.token,
        "stats",
        `getFull/${userId}`,
        "GET"
      );

      if (!response.ok)
        throw new Error(`fetching Full stats of user[${userId}] impossible`);

      const repStats = await response.json();

      if (!repStats.success) throw new Error(repStats.messsage);

      rep.data = repStats.data;
      rep.success = true;
    } catch (error: any) {
      throw new Error(error.message);
    }

    return rep;
  }

  public async getUserLevel(
    userId: number
  ): Promise<ReturnDataTyped<UserLevel>> {
    const rep: ReturnDataTyped<UserLevel> = {
      success: false,
      message: "",
    };

    try {
      const response = await fetchData(
        this.token,
        "stats",
        `getUserLevel/${userId}`,
        "GET"
      );

      if (!response.ok)
        throw new Error(`fetching User Level of user[${userId}] impossible`);

      const repStats = await response.json();

      if (!repStats.success) throw new Error(repStats.messsage);

      rep.data = repStats.data;
      rep.success = true;
    } catch (error: any) {
      throw new Error(error.message);
    }
    return rep;
  }

  public async getUserLevelUp(
    userId: number
  ): Promise<ReturnDataTyped<number>> {
    const rep: ReturnDataTyped<number> = {
      success: false,
      message: "",
    };

    try {
      const response = await fetchData(
        this.token,
        "stats",
        `getUserLevelUp/${userId}`,
        "GET"
      );

      if (!response.ok)
        throw new Error(`fetching User Level Up of user[${userId}] impossible`);

      const repStats = await response.json();

      if (!repStats.success) throw new Error(repStats.messsage);
      rep.message = repStats.message;
      rep.data = repStats.data;
      rep.success = true;
    } catch (error: any) {
      throw new Error(error.message);
    }
    return rep;
  }

  public async updateStats(userId: number, update: StatsUpdate): Promise<void> {
    try {
      const body = JSON.stringify(update);
      await fetchData(this.token, "stats", `update/${userId}`, "PUT", body);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async updateDemoWatched(userId: number): Promise<void> {
    try {
      await fetchData(
        this.token,
        "stats",
        `updateDemoWatched/${userId}`,
        "PUT"
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
