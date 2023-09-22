"use client";

import styles from "@/styles/lobby/party/DefineField.module.css";
import { Socket } from "socket.io-client";
import SearchInvite from "./SearchInvite";
import { MutableRefObject, useState } from "react";
import InviteSelected from "./InviteSelected";

type Props = {
  inviteId: MutableRefObject<number>;
  isChannel: MutableRefObject<number>;
  connected: MutableRefObject<boolean>;
  socket: Socket;
  profile: Profile;
};

export default function Invite({
  inviteId,
  isChannel,
  connected,
  socket,
  profile,
}: Props) {
	const	[invitation, setInvitation] = useState<Pongie | Channel | undefined>(undefined);

  const closeInvite = () => {
    setInvitation(undefined);
    inviteId.current = -1;
    isChannel.current = -1;
    connected.current = false;
  }

  const selectInvite = (item: Display) => {
    setInvitation(item);
    if ('name' in item) {
      isChannel.current = item.id;
      inviteId.current = -1;
      connected.current = false;
    }
    else {
      isChannel.current = -1;
      inviteId.current = item.id;
    }
  }

  return (
    <div className={styles.invite}>
      <h3 className={styles.section}>Invite Pongies</h3>
      <SearchInvite
        socket={socket}
        profile={profile}
        selectInvite={selectInvite}
      />

      {
        invitation &&
        <InviteSelected
          invitation={invitation}
          closeInvite={closeInvite}
          socket={socket}
          connected={connected}
        />
      }

    </div>
  );
}
