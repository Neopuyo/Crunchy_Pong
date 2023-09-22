import styles from "@/styles/profile/Profile.module.css";
import AvatarCard from "./avatar/AvatarCard";
import { Socket } from "socket.io-client";

type Props = {
  login: string;
  isOwner: boolean;
  avatar: Avatar;
  socket: Socket | undefined;
  avatars: Avatar[];
};

export default function ProfileFirstPart({ login, isOwner, avatar, socket, avatars }: Props) {

  return (
    <div className={`${styles.both} ${styles.first}`}>
      <AvatarCard
        login={login}
        isOwner={isOwner}
        avatar={avatar}
        socket={socket}
        avatars={avatars}
      />
    </div>
  );
}
