import AvatarMenu from "./AvatarMenu";
import ChatBtn from "./ChatBtn";
import NavbarLogo from "./NavbarLogo";
import Link from "next/link";
import Theme from "../theme/Theme";
import styles from "@/styles/navbar/Navbar.module.css";
import ChatService from "@/services/Chat.service";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "react-toastify";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

export default function NavbarConnected({
  avatar,
  token,
  profile,
}: {
  avatar: Avatar;
  token: string;
  profile: Profile;
}) {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const handleError = () => {
      toast.info("Connection closed! Reconnecting...");
      setSocket(undefined);
    };

    const disconnectClient = async () => {
      await disconnect();
      router.refresh();
    };

    if (!socket) {
      const intervalId = setInterval(async () => {
        try {
          const res = await fetch(
            `http://${process.env.HOST_IP}:3000/api/getToken`
          );
          if (!res.ok) throw new Error("fetch failed");

          const data = await res.json();

          if (!data.success) throw new Error("no cookie");

          const cookie = data.cookie;

          const chatService = new ChatService(cookie);
          if (chatService.disconnectClient) {
            clearInterval(intervalId);
            disconnectClient();
          } else if (chatService.socket) {
            setSocket(chatService.socket);
            clearInterval(intervalId);
          }
        } catch (err: any) {
          if (
            process.env &&
            process.env.ENVIRONNEMENT &&
            process.env.ENVIRONNEMENT === "dev"
          )
            console.log(err.message);
        }
      }, 2000);
    }

    socket?.on("disconnect", handleError);

    return () => {
      socket?.off("disconnect", handleError);
      socket?.off("connect_error");
      socket?.off("error");
      socket?.off("exception");
      socket?.off("refresh");
      socket?.off("disconnect");
      socket?.off("connect");
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <div>
      <nav className={styles.nav}>
        <NavbarLogo link="/home" />
        <div className={styles.right}>
          <Theme />
          <Link href={"/home/chat"}>
            <ChatBtn socket={socket} profile={profile} />
          </Link>
          <AvatarMenu avatar={avatar} profile={profile} socket={socket} />
        </div>
      </nav>
      <div className={styles.barBottom}></div>
    </div>
  );
}
