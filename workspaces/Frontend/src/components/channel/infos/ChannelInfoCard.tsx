"use client";

import { useState } from "react";
import styles from "@/styles/profile/InfoCard.module.css";
import NavbarChannelInfo from "./NavbarChannelInfo";
import SectionPongers from "./sections/SectionPongers";
import { Socket } from "socket.io-client";
import SectionCustomChannel from "./sections/custom channel/SectionCustomChannel";
import SectionChannelStatus from "./sections/SectionChannelStatus";


type Props = {
  myRelation: UserRelation;
  socket: Socket | undefined;
  relation: ChannelUsersRelation;
};

export default function ChannelInfoCard({
  relation,
  myRelation,
  socket
}: Props) {
  const [activeButton, setActiveButton] = useState(0);
 
  return (
    <>
      <NavbarChannelInfo
        activeButton={activeButton}
        setActiveButton={setActiveButton}
        myRelation={myRelation}
      />
      {(() => {
        switch (activeButton) {
          case 0:
            return (
              <SectionPongers
                relation={relation}
                myRelation={myRelation} socket={socket}
              />
            );
          case 1:
            return (
              <SectionChannelStatus relation={relation} />
            );
          case 2:
            return (
              <SectionCustomChannel relation={relation} socket={socket}/>
            );
          default:
            return (
              <div className={styles.sections}>
                contenu section? : default switch reached
              </div>
            );
        }
      })()}
    </>
  );
}
