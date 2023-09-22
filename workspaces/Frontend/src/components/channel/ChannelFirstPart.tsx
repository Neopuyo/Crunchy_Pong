import React from "react";
import styles from "@/styles/profile/Profile.module.css";
import ChannelAvatarCard from "./avatar/ChannelAvatarCard";

type Props = {
	channelAndUsersRelation: ChannelUsersRelation;
	myRelation:UserRelation;
	token: string;
  };

export default function ChannelFirstPart({ channelAndUsersRelation, myRelation, token }: Props) {
  return (
    <div className={`${styles.both} ${styles.first}`}>
      <ChannelAvatarCard
        channelAndUsersRelation={channelAndUsersRelation}
		    myRelation={myRelation}
        token={token}
      />
    </div>
  );
}
