import styles from "@/styles/chatPage/ChatDisplay.module.css";
import { faPeopleGroup, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";
import { Socket } from "socket.io-client";
import ChatChannel from "./ChatChannel/ChatChannel";
import DisplayInfos from "./displayInfos/DisplayInfos";
import {
  faMessage,
  faFaceLaughBeam,
} from "@fortawesome/free-regular-svg-icons";
import AskPassword from "./ChatChannel/protected/AskPassword";

export default function ChatDisplay({
  socket,
  display,
  littleScreen,
  closeDisplay,
  myself,
  openDisplay,
  status,
}: {
  socket: Socket | undefined;
  display: Display;
  littleScreen: boolean;
  closeDisplay: () => void;
  myself: Profile & { avatar: Avatar };
  openDisplay: (display: Display) => void;
  status: Map<string, string>;
}) {

  const renderIcon = (): ReactNode => {
    if (littleScreen)
      return (
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={closeDisplay}
          className={styles.iconArrow}
        />
      );

    if (!display)
      return <FontAwesomeIcon icon={faMessage} className={styles.icon} />;

    if ("button" in display && display.button === "new")
      return <FontAwesomeIcon icon={faMessage} className={styles.icon} />;

    if (
      "name" in display ||
      ("button" in display && display.button === "channels")
    )
      return <FontAwesomeIcon icon={faPeopleGroup} className={styles.icon} />;

    if (
      "login" in display ||
      ("button" in display && display.button === "pongies")
    )
      return <FontAwesomeIcon icon={faFaceLaughBeam} className={styles.icon} />;
  };

  if (!display) return <div className={styles.main}></div>;

  if ("needPassword" in display && display.needPassword === true) {
    return (
      <div className={styles.main} style={{
        marginLeft: littleScreen ? "0" : "-3px",
      }}>
        <AskPassword 
          channel={display}
          myself={myself}
          socket={socket}
          openDisplay={openDisplay}
          icon={renderIcon()}
        />
      </div>
    );
  }

  if ("button" in display && display.button === "new") {
    return (
      <div className={styles.main} style={{
        marginLeft: littleScreen ? "0" : "-3px",
      }}>
        <DisplayInfos
          icon={renderIcon()}
          socket={socket}
          openDisplay={openDisplay}
        />
      </div>
    );
  }

  if ("name" in display) {
      return (
        <div className={styles.main + " " + styles.noPadding} style={{
          marginLeft: littleScreen ? "0" : "-3px",
        }}>
          <ChatChannel
            icon={renderIcon()}
            channel={display}
            myself={myself}
            socket={socket}
            status={status}
          />
        </div>
      );
  }

  return <></>;
}
