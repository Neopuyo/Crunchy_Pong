import fetchData from "@/lib/fetch/fetchData";

export default class Channel_Service {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  public async getChannelAndUsers(id: number): Promise<ChannelUsersRelation> {
    try {
      const response: Response = await fetchData(
        this.token,
        "channel",
        id.toString(),
        "GET",
      );
      const data: ChannelUsersRelation = await response.json();

      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async getMyChannelRelation(id: number): Promise<ReturnDataTyped<UserRelation>> {
    let rep: ReturnDataTyped<UserRelation> = {
      success: false,
      message: "",
      };
    try {
      const response: Response = await fetchData(
        this.token,
        "channel",
        "relation/" + id.toString(),
        "GET"
        );

      if (!response.ok) throw new Error("Can't fetch user relation");

      const repRelation:ReturnDataTyped<UserRelation> = await response.json();
      if (!repRelation.success)
        throw new Error(repRelation.message);
      rep.success = true;
      rep.data = repRelation.data;

    } catch(e:any) {
      throw new Error(e.message);
    }
    return rep;
  }

  public async editRelation(
    channelId: number,
    userId: number,
    newRelation: {
      isBoss?: boolean;
      isChanOp?: boolean;
      isBanned?: boolean;
      joined?: boolean;
      invited?: boolean;
      muted?: boolean;
    }
  ):Promise<ReturnData> {
    let rep: ReturnData = {
      success: false,
      message: "",
    };

    try {
      if (Object.keys(newRelation).length === 0) {
        throw new Error("no relation property in request");
      }

      const body = JSON.stringify({
        channelId: channelId,
        userId: userId,
        newRelation: {
          ...(newRelation.isBoss !== undefined && {
            isBoss: newRelation.isBoss,
          }),
          ...(newRelation.isChanOp !== undefined && {
            isChanOp: newRelation.isChanOp,
          }),
          ...(newRelation.isBanned !== undefined && {
            isBanned: newRelation.isBanned,
          }),
          ...(newRelation.joined !== undefined && {
            joined: newRelation.joined,
          }),
          ...(newRelation.invited !== undefined && {
            invited: newRelation.invited,
          }),
          ...(newRelation.muted !== undefined && {
            muted: newRelation.muted,
          }),
        },
      });

      const response: Response = await fetchData(
        this.token,
        "channel",
        "editRelation",
        "PUT",
        body
      );
      if (!response.ok) throw new Error("failed getting response from server");
      const data: ReturnData = await response.json();
      rep.success = data.success;
      rep.message = data.message;
    } catch (e: any) {
      rep.message = e.message;
    }

    return rep;
  }

  /* -------- vvv NO NEED TOKEN HERE vvv ------- */

  public getIdsFromPrivateMsgChannelName(channelName: string): {
    id1: number;
    id2: number;
  } {
    const tuple: string[] = channelName.split(" ");

    if (tuple.length !== 2)
      return {
        id1: -1,
        id2: -1,
      };

    return {
      id1: parseInt(tuple[0]),
      id2: parseInt(tuple[1]),
    };
  }

  // name of Private Message channel format
  // 'id1 id2' with id1 < id2
  public formatPrivateMsgChannelName(id1: number, id2: number): string {
    const lower: number = id1 < id2 ? id1 : id2;
    const higher: number = id1 > id2 ? id1 : id2;

    return lower + " " + higher;
  }
}
