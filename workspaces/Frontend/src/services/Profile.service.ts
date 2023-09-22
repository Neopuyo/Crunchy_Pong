import { CryptoService } from "./Crypto.service";
import fetchData from "@/lib/fetch/fetchData";

const Crypto = new CryptoService();

export default class Profile_Service {
	private token?: string;

	constructor(token?: string) {
		if (token) this.token = token;
	}

	public async getProfileByToken(): Promise<Profile> {
		try {
			const profile = await fetchData(this.token, "users", "me", "GET");

			if (!profile.ok) {
				throw new Error("Profil cannot be found");
			}

			const data: Profile = await profile.json();

			data.first_name = (await Crypto.decrypt(data.first_name)).toString();
			data.last_name = (await Crypto.decrypt(data.last_name)).toString();
			data.email = (await Crypto.decrypt(data.email)).toString();
			data.phone = (await Crypto.decrypt(data.phone)).toString();
			data.image = (await Crypto.decrypt(data.image)).toString();

			return data;
		}
		catch (error: any) {
		  throw new Error(error.message);
		}
	}

	public async getProfileById(id: number): Promise<Profile> {
		try {
			const profile = await fetchData(
				this.token,
				"users",
				`profile/${id.toString()}`,
				"GET"
			);

			if (!profile.ok) {
				throw new Error("Profil cannot be found");
			}

			const data: Profile = await profile.json();

			data.first_name = (await Crypto.decrypt(data.first_name)).toString();
			data.last_name = (await Crypto.decrypt(data.last_name)).toString();
			data.email = (await Crypto.decrypt(data.email)).toString();
			data.phone = (await Crypto.decrypt(data.phone)).toString();
			data.image = (await Crypto.decrypt(data.image)).toString();

			return data;
		}
		catch (error: any) {
		  throw new Error(error.message);
		}
	}

	public async editUser(properties: Record<string, string>) {
		let rep: Rep = {
			success: false,
			message: "",
		};
		try {
			const body = JSON.stringify({ properties: properties });
			const response = await fetchData(this.token, "users", "", "PUT", body);

			if (response.ok) {
				rep.message = await response.json();
				rep.success = true;
			} else {
				rep.message = "error response from server, try it later please";
			}
		} catch (error: any) {
			if (error.message === 'disconnect')
				rep.message = 'disconnect';
			else
				rep.message = "error occured while editUser process";
		}

		return rep;
	}

	public async getProfileAndAvatar(): Promise<Profile & { avatar: Avatar }> {
		try {
			const profile = await fetchData(
				this.token,
				"users",
				"myAvatar",
				"GET",
				null
			);

			const data: Profile & { avatar: Avatar } = await profile.json();

			data.first_name = (await Crypto.decrypt(data.first_name)).toString();
			data.last_name = (await Crypto.decrypt(data.last_name)).toString();
			data.email = (await Crypto.decrypt(data.email)).toString();
			data.phone = (await Crypto.decrypt(data.phone)).toString();
			data.image = (await Crypto.decrypt(data.image)).toString();

			return data;
		}
		catch (error: any) {
			throw new Error(error.message);
		}
	}
}
