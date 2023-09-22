import { cookies } from "next/headers";
import Link from "next/link";
import styles from "@/styles/chatPage/ChatClient.module.css";
import ChatClient from "@/components/chatPage/ChatClient";
import Profile_Service from "@/services/Profile.service";
import ServerError from "../error/ServerError";

export default async function ChatServer({
  channelId,
}: {
  channelId: number | undefined;
}) {
  let token: string | undefined;
  let myself: Profile & {
    avatar: Avatar;
  };

  try {
    const getToken = cookies().get("crunchy-token")?.value;
    if (!getToken) throw new Error("No token value");

    token = getToken;

    const profilService = new Profile_Service(token);
    myself = await profilService.getProfileAndAvatar();
    if (myself.id === -1) throw new Error("no user");
  } catch (err) {
    if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
      console.log(err);
    return <ServerError />;
  }

  return (
    <main className={styles.chatPage}>
      <ChatClient token={token} myself={myself} channelId={channelId} />
    </main>
  );
}
