import styleMain from "@/styles/chatPage/ChatDisplay.module.css";
import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css"
import { Socket } from "socket.io-client";
import {
  faLock,

} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PasswordInput from "./PasswordInput";
import { ReactNode } from "react";

type Props = {
  channel: Channel;
  myself: Profile & { avatar: Avatar };
  socket: Socket | undefined;
  openDisplay: (display: Display) => void;
  icon: ReactNode;
}

export default function AskPassword({channel, myself, socket, openDisplay, icon}: Props) {

  return (
    <>
      <div className={styles.channelMsgFrame}>
      <div className={styles.icon}>{icon}</div>
        <div className={styles.popUp}>
          <p className={styles.icon} style={{color: "var(--notif)"}}><FontAwesomeIcon icon={faLock}/></p>
          <h2 style={{color: "var(--accent1)"}}>{channel.name}</h2>
          <h2>{"is protected by password"}</h2>
          <PasswordInput
            channel={channel}
            myself={myself}
            socket={socket}
            openDisplay={openDisplay}
          />
        </div>
      </div>
    </>
  )
}
