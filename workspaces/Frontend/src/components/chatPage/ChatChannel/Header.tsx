import InviteButton from "@/components/chatPage/ChatChannel/GameLink/InviteButton";
import AvatarUser from "@/components/avatarUser/AvatarUser";
import chooseColorStatus from "@/lib/colorStatus/chooseColorStatus";
import Channel_Service from "@/services/Channel.service";
import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css";
import { Badge, Tooltip } from "@mui/material";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import WatchButton from "./GameLink/WatchButton";
import LoadingComponent from "@/components/loading/Loading";

type Props = {
  icon: ReactNode;
  channel: Channel;
  myself: Profile & { avatar: Avatar };
  channelCodeName: string;
  status: Map<string, string>;
  addMsg: (msg: Message) => void;
};

export default function Header({
  icon,
  channel,
  myself,
  channelCodeName,
  status,
  addMsg,
}: Props) {
  const channelService = new Channel_Service();
  let url: string = "";
  const [color, setColor] = useState<string>("#edf0f0");
  const [textStatus, setTextStatus] = useState<string>("disconnected");
  const [loading, setLoading] = useState<boolean>(false);
  let otherId: number = -1;

  const badgeStyleStatus = {
    "& .MuiBadge-badge": {
      backgroundColor: color,
      border: "1px solid var(--tertiary1)",
      width: "12px",
      height: "12px",
      borderRadius: "100%",
      right: "5px",
    },
  };

  useEffect(() => {
    if (
      status &&
      status.size > 0 &&
      channel.type === "privateMsg" &&
      channel.statusPongieId
    ) {
      if (status.has(channel.statusPongieId.toString())) {
        const text = status.get(channel.statusPongieId.toString()) as string;
        setTextStatus(text);
        setColor(chooseColorStatus(text));
      }
    }
  }, [status, channel]);

  if (channel.type === "privateMsg" && channelCodeName) {
    const tuple: {
      id1: number;
      id2: number;
    } = channelService.getIdsFromPrivateMsgChannelName(channelCodeName);

    otherId = myself.id === tuple.id1 ? tuple.id2 : tuple.id1;
    url = "/home/profile/" + otherId;
  } else {
    url = "/home/channel/" + channel.id;
  }

  return (
    <div className={styles.header}>
      <div className={styles.icon}>{icon}</div>
      <Link href={url} className={styles.card}>
        {channel.type === "privateMsg" && (
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
                  borderSize="3px"
                  borderColor={channel.avatar.borderColor}
                  backgroundColor={channel.avatar.backgroundColor}
                  fontSize="1rem"
                />
              </div>
            </Badge>
          </Tooltip>
        )}
        {channel.type !== "privateMsg" && (
          <div className={styles.avatar}>
            <AvatarUser
              avatar={channel.avatar}
              borderSize="3px"
              borderColor={channel.avatar.borderColor}
              backgroundColor={channel.avatar.backgroundColor}
              fontSize="1rem"
            />
          </div>
        )}

        <div
          style={{ color: channel.avatar.borderColor }}
          className={styles.name}
        >
          {channel.name}
        </div>
      </Link>

      {
        !loading && (channel.type !== "privateMsg" || textStatus === "connected") &&
        <InviteButton
          myself={myself}
          setLoading={setLoading}
          opponentLogin={channel.name}
          opponentId={-1}
          addMsg={addMsg}
          isChannel={true}
        />
      }

      {
        !loading && channel.type === "privateMsg" && textStatus === "in game" &&
        <div className={styles.inviteButton}>
          <WatchButton userId={otherId} setLoading={setLoading} />
        </div>
      }

      {
        loading &&
        <LoadingComponent />
      }

    </div>
  );
}
