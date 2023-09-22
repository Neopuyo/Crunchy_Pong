import styles from "@/styles/profile/InfoCard.module.css";
import MottoEditable from "./custom/tagline/MottoEditable";
import StoryEditable from "./custom/story/StoryEditable";
import ConfigAuthEditable from "./custom/configAuth/ConfigAuthEditable";
import GameKey from "./custom/gameKey/GameKey";
import { Dispatch, SetStateAction } from "react";
import { Socket } from "socket.io-client";

type Props = {
  profile: Profile;
  setLogin: Dispatch<SetStateAction<string>>;
  socket: Socket | undefined;
};

export default function SectionCustom({ profile, setLogin, socket }: Props) {
  return (
    <div className={`${styles.sections} ${styles.columnStart}`}>
      <MottoEditable profile={profile} />
      <StoryEditable profile={profile} />
      <ConfigAuthEditable
        profile={profile}
        setLogin={setLogin}
        socket={socket}
      />
      <GameKey profile={profile} />
    </div>
  );
}
