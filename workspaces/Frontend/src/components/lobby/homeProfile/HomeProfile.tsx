"use client";

import styles from "@/styles/lobby/homeProfile/HomeProfile.module.css";
import GameStats from "./GameStats";
import AvatarProfile from "./AvatarProfile";
import { Socket } from "socket.io-client";

type Props = {
  profile: Profile;
  avatar: Avatar;
  socket: Socket | undefined
};

export default function HomeProfile({ profile, avatar, socket }: Props) {
  return (
    <div className={styles.homeProfil}>
      <AvatarProfile profile={profile} avatar={avatar} />
      <GameStats profile={profile} socket={socket} />
    </div>
  );
}
