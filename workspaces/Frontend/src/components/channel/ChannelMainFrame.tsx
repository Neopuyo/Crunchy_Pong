"use client";

import React from "react";
import styles from "@/styles/profile/Profile.module.css";
import ChannelFirstPart from "./ChannelFirstPart";
import ChannelSecondPart from "./ChannelSecondPart";
import { Socket } from "socket.io-client";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";
import ChatService from "@/services/Chat.service";
import { useEffect, useState } from "react";
import LoadingSuspense from "../loading/LoadingSuspense";
import Avatar_Service from "@/services/Avatar.service";
import Channel_Service from "@/services/Channel.service";

type Props = {
  channelAndUsersRelation: ChannelUsersRelation;
  myRelation: UserRelation;
  token: string;
};

export default function ChannelMainFrame({
  channelAndUsersRelation,
  myRelation,
  token,
}: Props) {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const router = useRouter();
  const id = channelAndUsersRelation.channel.id;
  const [relation, setRelation] = useState<ChannelUsersRelation>(
    channelAndUsersRelation
  );
  const [me, setMe] = useState<UserRelation>(myRelation);

  // refresh channel user relation
  const reloadData = async () => {
    const avatarService = new Avatar_Service(undefined);
    const channelService = new Channel_Service(undefined);

    try {
      const updatedRelation = await channelService.getChannelAndUsers(id);
      updatedRelation.channel.avatar =
        await avatarService.getChannelAvatarById(id);

      const findStatus: UserRelation | undefined =
        updatedRelation.usersRelation.find(
          (relation) => relation.userId === myRelation.userId
        );

      if (findStatus && updatedRelation && updatedRelation.channel.avatar) {
        setMe(findStatus);
        setRelation(updatedRelation);
      }
    } catch (e: any) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("Error while updating channel profile : " + e.message);
    }
  };

  // Chat Websocket call
  useEffect(() => {
    const handleError = () => {
      setSocket(undefined);
    };

    const disconnectClient = async () => {
      await disconnect();
      router.refresh();
    };

    if (!socket) {
      const intervalId = setInterval(async () => {
          const chatService = new ChatService();
          if (chatService.disconnectClient) {
            clearInterval(intervalId);
            disconnectClient();
          } else if (chatService.socket) {
            setSocket(chatService.socket);
            clearInterval(intervalId);
          }
      }, 500);
    }

    socket?.on("editRelation", reloadData);
    socket?.on("notif", reloadData);
    socket?.on("disconnect", handleError);

    return () => {
      socket?.off("editRelation", reloadData);
      socket?.off("notif", reloadData);
      socket?.off("disconnect", handleError);
    };
  }, [socket]);

  if (!socket) return <LoadingSuspense />;

  return (
    <div className={styles.profileMainFrame}>
      <ChannelFirstPart
        token={token}
        channelAndUsersRelation={relation}
        myRelation={me}
      />
      <ChannelSecondPart socket={socket} relation={relation} myRelation={me} />
    </div>
  );
}
