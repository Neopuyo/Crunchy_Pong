"use client";

//Import les composants react
import { useState } from "react";

//Import le service pour les games
import LobbyService from "@/services/Lobby.service";
import styles from "@/styles/lobby/Lobby.module.css";
import League from "@/components/lobby/league/League";
import Party from "@/components/lobby/party/Party";
import Training from "@/components/lobby/training/Training";
import NavLobby from "./NavLobby";
import { Socket } from "socket.io-client";

type Props = {
  profile: Profile;
  socket: Socket;
  avatar: Avatar;
};

export default function Lobby({ profile, socket, avatar }: Props) {
  const lobbyService = new LobbyService();
  const [menu, setMenu] = useState<string>("League");

  return (
    <div className={styles.lobby}>
      <NavLobby menu={menu} setMenu={setMenu} />
      <div className={styles.content}>
        {menu == "League" && <League profile={profile} />}
        {menu == "Party" && (
          <Party
            lobbyService={lobbyService}
            profile={profile}
            socket={socket}
            avatar={avatar}
          />
        )}
        {menu == "Training" && <Training profile={profile} />}
      </div>
    </div>
  );
}
