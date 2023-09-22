import styles from "@/styles/profile/Profile.module.css";
import ChannelInfoCard from "./infos/ChannelInfoCard";
import { Socket } from "socket.io-client";

type Props = {
	relation: ChannelUsersRelation;
	myRelation: UserRelation;
	socket: Socket | undefined;
  };

export default function ChannelSecondPart({ relation, myRelation, socket }: Props) {

  return (
	<div className={styles.both + " " + styles.second}>
		<ChannelInfoCard relation={relation} myRelation={myRelation} socket={socket}  />
	</div>
  );
}
