import Profile_Service from "@/services/Profile.service";
import { cookies } from "next/headers";
import fs from "fs";
import FormLogin from "./FormLogin";
import ServerError from "../error/ServerError";

export default async function CreateServer() {
  let profile: Profile = {
    id: -1,
    login: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    image: "",
    provider: "",
    motto: "",
    story: "",
    gameKey: "Arrow",
  };
  let token: string | undefined = undefined;
  let avatars: string[] = [];
  let avatarCrypted: string | undefined = undefined;

  try {
    const getToken = cookies().get("crunchy-token")?.value;
    if (!getToken) throw new Error("No token value");

    token = getToken;

    const profileData = new Profile_Service(token);
    profile = await profileData.getProfileByToken();

    if (profile.id === -1) throw new Error("no user");

    const directoryPath = "/home/workspaces/Frontend/public/images/avatars";
    avatars = fs.readdirSync(directoryPath);

    avatars = avatars.map((avatar) => {
      if (avatar.includes("avatar")) return "/images/avatars/" + avatar;
      return avatar;
    });
  } catch (err) {
    return <ServerError />;
  }

  if (profile.provider === "42") avatarCrypted = profile.image;

  return (
    <div>
      <FormLogin
        token={token as string}
        avatars={avatars}
        avatarCrypted={avatarCrypted}
        profile={profile}
      />
    </div>
  );
}
