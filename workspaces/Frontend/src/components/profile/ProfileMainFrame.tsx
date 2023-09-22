"use client";

import styles from "@/styles/profile/Profile.module.css";
import ProfileFirstPart from "./ProfileFirstPart";
import ProfileSecondPart from "./ProfileSecondPart";
import { useEffect, useState } from "react";
import ChatService from "@/services/Chat.service";
import { Socket } from "socket.io-client";
import LoadingSuspense from "../loading/LoadingSuspense";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  profile: Profile;
  isOwner: boolean;
  avatar: Avatar;
  token: string;
  avatars: Avatar[];
};

export default function ProfileMainFrame({
  profile,
  isOwner,
  avatar,
  token,
  avatars,
}: Props) {
  const [login, setLogin] = useState<string>(profile.login);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const router = useRouter();

  // WsException Managing
  useEffect(() => {
    const handleError = () => {
      setSocket(undefined);
    };

    const disconnectClient = async () => {
      await disconnect();
      router.refresh();
    };

    if (!socket) {
      const intervalId = setInterval(async () => {
          const chatService = new ChatService();
          if (chatService.disconnectClient) {
            clearInterval(intervalId);
            disconnectClient();
          } else if (chatService.socket) {
            setSocket(chatService.socket);
            clearInterval(intervalId);
          }
      }, 500);
    }

    socket?.on("disconnect", handleError);

    return () => {
      socket?.off("disconnect", handleError);
    };
  }, [socket]);

  if (!socket) return <LoadingSuspense />;

  return (
    <main className={styles.main}>
      <div className={styles.profileMainFrame}>
        <ProfileFirstPart
          login={login}
          isOwner={isOwner}
          avatar={avatar}
          socket={socket}
          avatars={avatars}
        />
        <ProfileSecondPart
          profile={profile}
          isOwner={isOwner}
          setLogin={setLogin}
          socket={socket}
        />
      </div>
    </main>
  );
}
