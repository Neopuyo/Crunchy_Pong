"use client";

import { Player } from "@transcendence/shared/types/Game.types";

import styles from "@/styles/lobby/lobbyList/PlayerInfo.module.css";
import AvatarUser from "@/components/avatarUser/AvatarUser";

function showPlayer(
  player: Player,
  side: "Left" | "Right",
  showDetail: boolean
) {
  const nameStyle = {
    color: `rgb(${player?.color.r}, ${player?.color.g}, ${player?.color.b})`,
  };
  const avatar: Avatar = {
    image: player.avatar.image,
    variant: player.avatar.variant,
    borderColor: player.avatar.borderColor,
    backgroundColor: player.avatar.backgroundColor,
    text: player.avatar.text,
    empty: player.avatar.empty,
    isChannel: false,
    decrypt: player.avatar.decrypt,
  };

  return (
    <div className={side === "Left" ? styles.leftPlayer : styles.rightPlayer}>
      <div className={styles.avatar}>
        <AvatarUser
          avatar={avatar}
          borderSize={"3px"}
          backgroundColor={avatar.backgroundColor}
          borderColor={avatar.borderColor}
          fontSize="1rem"
        />
      </div>
      {showDetail && <p style={nameStyle}>{player.name}</p>}
    </div>
  );
}

type Props = {
  playerLeft: Player;
  playerRight: Player;
  showDetail: boolean;
};

export default function Info({ playerLeft, playerRight, showDetail }: Props) {
  return (
    <div className={styles.playerInfo}>
      {showPlayer(playerLeft, "Left", showDetail)}
      <p className={styles.vs}>{" VS "}</p>
      {showPlayer(playerRight, "Right", showDetail)}
    </div>
  );
}
