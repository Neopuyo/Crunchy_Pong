import { cookies } from "next/dist/client/components/headers";
import Profile_Service from "@/services/Profile.service";
import FooterFront from "./FooterFront";

export default async function FooterServer() {
  let token: string | undefined;
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

  try {
    token = cookies().get("crunchy-token")?.value;
    if (!token) throw new Error("No token value");

    const profileData = new Profile_Service(token);
    profile = await profileData.getProfileByToken();
  } catch (error: any) {
  }

  return <FooterFront profile={profile} />;
}
