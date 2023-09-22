"use client";

import styles from "@/styles/lobby/party/Party.module.css";
import LobbyService from "@/services/Lobby.service";
import CreateParty from "@/components/lobby/party/CreateParty";
import PartyList from "@/components/lobby/lobbyList/LobbyList";
import { Socket } from "socket.io-client";

type Props = {
  lobbyService: LobbyService;
  profile: Profile;
  socket: Socket;
  avatar: Avatar;
};

export default function Party({ lobbyService, profile, socket, avatar }: Props) {
  return (
    <div className={styles.party}>
      {
        <CreateParty
          lobbyService={lobbyService}
          userId={profile.id}
          socket={socket}
          profile={profile}
          avatar={avatar}
        />
      }
      {<PartyList lobbyService={lobbyService} mode={"Party"} />}
    </div>
  );
}
