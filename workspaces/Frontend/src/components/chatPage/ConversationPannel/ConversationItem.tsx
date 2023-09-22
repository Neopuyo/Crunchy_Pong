import styles from "@/styles/chatPage/Conversations.module.css";
import AvatarUser from "../../avatarUser/AvatarUser";
import { Badge, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { PongColors } from "@/lib/enums/PongColors.enum";
import chooseColorStatus from "@/lib/colorStatus/chooseColorStatus";

type Props = {
    channel: Channel,
    handleClick: (channel:Channel) => void;
    handleLeave: (channel:Channel) => void;
    notifMsg: NotifMsg[];
    isRecentSection:boolean;
    status: Map<string, string>;
}

const badgeStyle = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--primary1)',
    border: '2px solid var(--notif)',
	  right: "1px",
	}
}

export default function ConversationItem({
  channel,
  handleClick,
  handleLeave,
  notifMsg,
  isRecentSection,
  status,
}: Props) {

  const [isFocused, setIsFocused] = useState(false);

  const handleFocusOn = () => {
    setIsFocused(true);
  };

  const handleFocusOff = () => {
    setIsFocused(false);
  };

  const handleHover = () => {
    setIsFocused(true);
  };

  const handleMouseLeave = () => {
    setIsFocused(false);
  };

  const [buttonIsFocused, setButtonIsFocused] = useState(false);

  const buttonFocusOn = () => {
    setIsFocused(true);
  };

  const buttonFocusOff = () => {
    setButtonIsFocused(false);
  };

  const buttonHover = () => {
    setButtonIsFocused(true);
  };

  const buttonMouseLeave = () => {
    setButtonIsFocused(false);
  };


  const rowClick = () => {
    if (!buttonIsFocused) handleClick(channel);
  }

  const leaveButtonClick = () => {
      handleLeave(channel);
  }

    let date = '';
    let nbMsg = 0;
    // const [nbMsg, setNbMsg] = useState<number>(0);

    if (channel.lastMessage?.createdAt) {
      const diff = (Date.now() - new Date(channel.lastMessage.createdAt).getTime()) / 1000;
      date = diff < 60
        ? Math.floor(diff) + 's'
        : diff < 3600
        ? Math.floor(diff / 60) + 'min'
        : diff < 86400
        ? Math.floor(diff / 60 / 60) + 'h'
        : diff < 604800
        ? Math.floor(diff / 60 / 60 / 24) + 'd'
        : Math.floor(diff / 60 / 60 / 24 / 7) + 'w';
    }

    if (notifMsg.length >= 1) {
      for (const notif of notifMsg) {
        if (notif.channelId === channel.id)
          nbMsg = notif.nbMessages;
      }
    }

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
  
      if (status && status.size > 0
        && channel.type === "privateMsg"
        && channel.statusPongieId
      ) {

        if (status.has(channel.statusPongieId.toString())) {
          const	text = status.get(channel.statusPongieId.toString()) as string;
          setTextStatus(text);
          setColor(chooseColorStatus(text));
        }
      }
      
    }, [status]);
  
    return (
      <div className={styles.list} onClick={rowClick}
      onFocus={handleFocusOn}
      onBlur={handleFocusOff}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
      >
        
        <Badge badgeContent={nbMsg}
          overlap="circular"
          sx={badgeStyle}
        >
          {
            channel.type === "privateMsg" &&
            <Tooltip title={textStatus} placement="top" arrow>
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
                    avatar={channel.avatar}
                    borderSize="2px"
                    borderColor={channel.avatar.borderColor}
                    backgroundColor={channel.avatar.backgroundColor}
                    fontSize="1rem"
                  />
                </div>
              </Badge>
            </Tooltip>
          }
          {
            channel.type !== "privateMsg" &&
            <div className={styles.avatar}>
              <AvatarUser
                avatar={channel.avatar}
                borderSize="2px"
                borderColor={channel.avatar.borderColor}
                backgroundColor={channel.avatar.backgroundColor}
                fontSize="1rem"
              />
            </div>
          }
        </Badge>
        
        <div className={styles.name}>
          <h4>{channel.name}</h4>
          {channel.lastMessage && (
            <p>
              {channel.lastMessage.user?.login ? channel.lastMessage.user.login : '****'}:{' '}
              {channel.lastMessage.content}
            </p>
          )}
        </div>
  
          {isFocused && !isRecentSection &&(
            <FontAwesomeIcon 
              className={styles.xMark}
              icon={faXmark} onClick={leaveButtonClick}
              onFocus={buttonFocusOn}
              onBlur={buttonFocusOff}
              onMouseEnter={buttonHover}
              onMouseLeave={buttonMouseLeave}
              />
          )}

        {!isFocused && (
        <div className={styles.time}>
          {channel.lastMessage && <p>{date}</p>}
        </div>
        )}
      </div>
    );
}
