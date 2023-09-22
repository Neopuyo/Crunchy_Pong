"use client";

import { Dispatch, SetStateAction, useState } from "react";
import NavbarProfilInfo from "./NavbarProfilInfo";
import SectionPongStats from "./sections/SectionPongStats";
import SectionCustom from "./sections/SectionCustom";
import { Socket } from "socket.io-client";
import SectionPongies from "./sections/SectionPongies";
import SectionChannels from "./sections/SectionChannels";
import SectionAchievements from "./sections/fullAchievement/SectionAchievements";

type Props = {
  profile: Profile;
  isOwner: boolean;
  setLogin: Dispatch<SetStateAction<string>>;
  socket: Socket | undefined;
};

export default function InfoCard({
  profile,
  isOwner,
  setLogin,
  socket,
}: Props) {
  const [activeButton, setActiveButton] = useState(0);

  return (
    <div>
      <NavbarProfilInfo
        activeButton={activeButton}
        setActiveButton={setActiveButton}
        isOwner={isOwner}
        socket={socket}
      />
      {(() => {
        switch (activeButton) {
          case 0:
            return <SectionPongStats profile={profile} socket={socket} isOwner={isOwner} />;
          case 1:
            return <SectionAchievements profile={profile} socket={socket} isOwner={isOwner} />;
          case 2:
            return (
              <SectionPongies
                socket={socket}
                isOwner={isOwner}
                profile={profile}
              />
            );
          case 3:
            return (
              <SectionChannels
                socket={socket}
                isOwner={isOwner}
                profile={profile}
              />
            );
          case 4:
            return (
              <SectionCustom
                profile={profile}
                setLogin={setLogin}
                socket={socket}
              />
            );
          default:
            return <SectionPongStats profile={profile} socket={socket} isOwner={isOwner} />;
        }
      })()}
    </div>
  );
}
