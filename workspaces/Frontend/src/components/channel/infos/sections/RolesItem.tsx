import styles from "@/styles/profile/InfoCard.module.css";
import AvatarUser from "../../../avatarUser/AvatarUser";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChanOpControlPannel from "./ChanOpControlPannel";
import { ChannelRoles } from "@/lib/enums/ChannelRoles.enum";
import { Socket } from "socket.io-client";
import {
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import chooseColorStatus from "@/lib/colorStatus/chooseColorStatus";
import { Badge, Tooltip } from "@mui/material";

type Props = {
  channelId:number;
  relation: UserRelation;
  myRelation: UserRelation;
  role: ChannelRoles;
  onFocusOn: () => void;
  onFocusOff: () => void;
  onHover: () => void;
  onLeave: () => void;
  lists:ChannelLists;
  socket: Socket | undefined;
  status: Map<string, string>;
};

export default function RolesItem({ channelId, relation, myRelation, role, onFocusOn, onFocusOff, onHover, onLeave, lists, socket, status }: Props) {
  
  const [isFocused, setIsFocused] = useState(false);
  const	[color, setColor] = useState<string>("#edf0f0");
  const	[textStatus, setTextStatus] = useState<string>("disconnected");

  const badgeStyleStatus = {
    "& .MuiBadge-badge": {
      backgroundColor: color,
      border: "1px solid var(--tertiary1)",
      width: "12px",
      height: "12px",
      borderRadius: "100%",
      right: "5px",
    }
  }

  useEffect(() => {
		if (status && status.size > 0) {
			if (status.has(relation.user.id.toString())) {
				const	text = status.get(relation.user.id.toString()) as string;
				setTextStatus(text);
				setColor(chooseColorStatus(text));
			}
		}
		
	}, [status]);

  const handleFocusOn = () => {
    setIsFocused(true);
    onFocusOn();
  };

  const handleFocusOff = () => {
    setIsFocused(false);
    onFocusOff();
  };

  const handleHover = () => {
    setIsFocused(true);
    onHover();
  };

  const handleMouseLeave = () => {
    setIsFocused(false);
    onLeave();
  };


  return (
    <article
      className={isFocused ? `${styles.row} ${styles.focused}` : styles.row}
      key={relation.userId}
      onFocus={handleFocusOn}
      onBlur={handleFocusOff}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
    >
      <Tooltip title={textStatus} placement="left" arrow>
        <Badge
          overlap="circular"
          sx={badgeStyleStatus}
          variant="dot"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <div className={styles.avatar}>
            <AvatarUser
              avatar={relation.user.avatar}
              borderSize="2px"
              backgroundColor={relation.user.avatar.backgroundColor}
              borderColor={relation.user.avatar.borderColor}
              fontSize="1rem"
            />
          </div>
        </Badge>
      </Tooltip>
      <Link
        href={`/home/profile/${relation.userId}`}
        style={{ color: relation.user.avatar.borderColor }}
      >
        {relation.user.login}
        {relation.muted && <FontAwesomeIcon icon={faVolumeXmark} style={{marginLeft: "0.3rem"}}/>}
      </Link>

      { isFocused && ((myRelation.isChanOp || myRelation.isBoss) && myRelation.joined && !myRelation.isBanned) && <ChanOpControlPannel channelId={channelId} role={role} relation={relation} myRelation={myRelation} lists={lists} socket={socket}/>}
    </article>
  );
}
