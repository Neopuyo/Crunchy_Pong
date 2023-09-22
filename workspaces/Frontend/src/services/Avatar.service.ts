import fetchData from "@/lib/fetch/fetchData";
import { CryptoService } from "./Crypto.service";

const Crypto = new CryptoService();

export default class Avatar_Service {
  private token?: string;

  constructor(token?: string) {
    if (token) this.token = token;
  }

  private makeUrl(id: number, isChannel: boolean): string {
    const boolAsString: string = isChannel ? "true" : "false";
    return id.toString() + "/" + boolAsString;
  }

  /* ----------------------------- PUBLIC METHODS ---------------------------- */

  public async getAvatarbyUserId(id: number): Promise<Avatar> {
    try {
      const response: Response = await fetchData(
        this.token,
        "avatar",
        this.makeUrl(id, false),
        "GET"
      );
      const data: Avatar = await response.json();

      if (data?.decrypt && data?.image.length > 0) {
        data.image = await Crypto.decrypt(data.image);
        data.decrypt = false;
      }

      return data;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async getChannelAvatarById(id: number): Promise<Avatar> {
    try {
      const response: Response = await fetchData(
        this.token,
        "avatar",
        this.makeUrl(id, true),
        "GET"
      );
      const avatar: Avatar = await response.json();

      if (avatar?.decrypt && avatar?.image.length > 0) {
        avatar.image = await Crypto.decrypt(avatar.image);
        avatar.decrypt = false;
      }

      return avatar;
    }
    catch (error: any) {
      throw new Error(error.message);
    }
  }

  // isChannel value is the channelId, 0 mean it's not a channel but an user's.
  public async submitAvatarColors(
    borderColor: string,
    backgroundColor: string,
    channelId: number,
  ):Promise<ReturnData> {
	try {
		const body = JSON.stringify({ borderColor, backgroundColor, channelId });
		const response = await fetchData(undefined, "avatar", "", "PUT", body);

		if (!response.ok)
			throw new Error("submitAvatarColors error");

		const data:ReturnData = await response.json();
		return (data);
	} catch(e:any) {
		throw new Error(e.message);
	}
  }

  // isChannel value is the channelId, 0 mean it's not a channel but an user's.
  public async submitAvatarUser(
    avatar: Avatar,
    topColor: string,
    botColor: string,
  ):Promise<ReturnData> {
    try {
      const {isChannel, ...avatarBackend} = avatar;
      avatarBackend.backgroundColor = botColor;
      avatarBackend.borderColor = topColor;
      const body = JSON.stringify({ ...avatarBackend });
      const response = await fetchData(undefined, "avatar", "avatarUser", "PUT", body);

      if (!response.ok)
        throw new Error("submitAvatarColors error");

      const data:ReturnData = await response.json();
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(data);
      return (data);
    } catch(e:any) {
      throw new Error(e.message);
    }
  }
}
