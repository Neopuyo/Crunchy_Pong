import { useEffect, useRef, useState } from "react";
import styles from "@/styles/chatPage/Conversations.module.css";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot, faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { Socket } from "socket.io-client";
import SearchBar from "../searchBar/SearchBar";
import { EditChannelRelation } from "@/types/Channel-linked/EditChannelRelation";
import ConversationItem from "./ConversationItem";
import Channel_Service from "@/services/Channel.service";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

export default function Conversations({
  socket,
  maxWidth,
  openDisplay,
  clearDisplay,
  myself,
  status,
  display,
  channelId,
  littleScreen,
}: {
  socket: Socket | undefined;
  maxWidth: string;
  openDisplay: (display: Display) => void;
  clearDisplay: () => void;
  myself: Profile & { avatar: Avatar };
  status: Map<string, string>;
  display: Display;
  channelId: number | undefined;
  littleScreen: boolean;
}) {
  const [notifMsg, setNotifMsg] = useState<NotifMsg[]>([]);
  const nothing = useRef<boolean>(channelId !== undefined ? false : true);
  const router = useRouter();

  const loadData = () => {
    socket?.emit("getChannels", (channels: Channel[]) => {
      setChannels(channels);

      if (channels.length > 0 && nothing.current === true && !littleScreen) {
        const joinedChannels = channels
                .filter(channel => channel.joined === true && channel.isBanned === false)
                .sort((channelA, channelB) => {
                  if (channelA.type === "privateMsg" && channelB.type !== "privateMsg")
                    return 1;
                  if (channelA.type !== "privateMsg" && channelB.type === "privateMsg")
                    return -1;
                  if (!channelA.lastMessage)
                    return -1;
                  if (!channelB.lastMessage)
                    return 1;
                  const timeA = new Date(channelA.lastMessage.createdAt).getTime();
                  const timeB = new Date(channelB.lastMessage.createdAt).getTime();
                  return timeB - timeA;
                });
        if (!joinedChannels)
          return ;
        nothing.current = false;
        openDisplay(joinedChannels[0]);
      }
    });
  }

  // if nothing in display, open first channel joined if there is one
  useEffect(() => {
    if (channels.length > 0 && nothing.current === true && !littleScreen) {
      const joinedChannels = channels
              .filter(channel => channel.joined === true && channel.isBanned === false)
              .sort((channelA, channelB) => {
                if (channelA.type === "privateMsg" && channelB.type !== "privateMsg")
                  return 1;
                if (channelA.type !== "privateMsg" && channelB.type === "privateMsg")
                  return -1;
                if (!channelA.lastMessage)
                  return -1;
                if (!channelB.lastMessage)
                  return 1;
                const timeA = new Date(channelA.lastMessage.createdAt).getTime();
                const timeB = new Date(channelB.lastMessage.createdAt).getTime();
                return timeB - timeA;
              });
      if (!joinedChannels)
        return ;
      nothing.current = false;
      openDisplay(joinedChannels[0]);
    }
  }, [littleScreen]);

  // ChatWebSocket Management
  useEffect(() => {

    const updateNotif = () => {
      socket?.emit('getNotifMsg', (payload: NotifMsg[]) => {
        setNotifMsg(payload);
      });
    }

    const updateChannels = (payload: {
      why: string;
    }) => {
      if (payload && payload.why && payload.why === "updateChannels")
        loadData();
    }

    socket?.on("notif", updateChannels);
    socket?.on('notifMsg', updateNotif);
    socket?.on("editRelation", loadData);

    loadData();
    updateNotif();
    
    return () => {
      socket?.off("notif", updateChannels);
      socket?.off("notifMsg", updateNotif);
      socket?.off("editRelation", loadData);
    }
  }, [socket]);

  // Conversation lists Pannel
  const [channels, setChannels] = useState<Channel[]>([]);

  const handleClickDefault = (channel: Channel) => {
    openDisplay(channel);
  };

  const handleLeave = async (channel: Channel) => {

    socket?.emit('clearNotif', {
      which: "messages",
      id: channel.id,
    });

    if (channel.joined === false && channel.invited === false) {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("no feature keepTrack channel yet");
      return ;
    }

    try { 
      const channelService = new Channel_Service(undefined);
      const rep:ReturnData = await channelService.editRelation(channel.id, myself.id, {invited:false, joined: false});

      if (rep.success) {
        const newRelation:EditChannelRelation = {
          channelId: channel.id,
          userId: myself.id,
          senderId: myself.id,
          newRelation: {
            joined: false,
            invited:false,
          }
        }

        socket?.emit("editRelation", newRelation);
        loadData();
        if ("name" in display && display.id === channel.id)
          clearDisplay();  
      } else
        throw new Error(rep.message);
    } catch(e:any) {
      if (e.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("Leave channel error : " + e.message);
    }
  };

  const handleClickAcceptInvite = async (channel: Channel) => {
    try {
      const channelService = new Channel_Service(undefined);
      const rep:ReturnData = await channelService.editRelation(channel.id, myself.id, {invited:false, joined: true});

      if (rep.success) {
        const newRelation:EditChannelRelation = {
          channelId: channel.id,
          userId: myself.id,
          senderId: myself.id,
          newRelation: {
            joined: true,
            invited:false,
          }
        }
        socket?.emit("editRelation", newRelation);
        openDisplay(channel);
      }
      else
        throw new Error(rep.message);
    } catch(e:any) {
      if (e.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("JoinRecent channel error : " + e.message);
    }
  };

  const handleClickJoinRecent = async (channel: Channel) => {
    try {

      if (channel.type === "protected" && !channel.isBoss) {
        openDisplay({...channel, needPassword: true});
        return ;
      }

      const channelService = new Channel_Service(undefined);
      const rep:ReturnData = await channelService.editRelation(channel.id, myself.id, {joined: true});
      
      if (rep.success) {
        const newRelation:EditChannelRelation = {
          channelId: channel.id,
          userId: myself.id,
          senderId: myself.id,
          newRelation: {
            joined: true,
          }
        }
        socket?.emit("editRelation", newRelation);
        openDisplay(channel);
        loadData();
      }
      else
        throw new Error(rep.message);
    } catch(e:any) {
      if (e.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("JoinRecent channel error : " + e.message);
    }
  };

  const joinedConversations = channels
  .filter(channel => channel.type !== "privateMsg" && channel.joined === true && channel.isBanned === false)
  .sort((channelA, channelB) => {
    if (!channelA.lastMessage)
      return -1;
    if (!channelB.lastMessage)
      return 1;
    const timeA = new Date(channelA.lastMessage.createdAt).getTime();
    const timeB = new Date(channelB.lastMessage.createdAt).getTime();
    return timeB - timeA;
  })
  .map((channel) => (
    channel ? (
      <ConversationItem
        key={channel.id}
        channel={channel}
        handleClick={handleClickDefault}
        handleLeave={handleLeave}
        notifMsg={notifMsg}
        isRecentSection={false}
        status={status}
      />
    ) : null
  ));

  const pmConversations = channels
  .filter(channel => channel.type === "privateMsg" && channel.joined === true)
  .sort((channelA, channelB) => {
    if (!channelA.lastMessage)
      return -1;
    if (!channelB.lastMessage)
      return 1;
    const timeA = new Date(channelA.lastMessage.createdAt).getTime();
    const timeB = new Date(channelB.lastMessage.createdAt).getTime();
    return timeB - timeA;
  })
  .map((channel) => (
    channel ? (
      <ConversationItem
        key={channel.id}
        channel={channel}
        handleClick={handleClickDefault}
        handleLeave={handleLeave}
        notifMsg={notifMsg}
        isRecentSection={false}
        status={status}
      />
    ) : null
  ));

  const invitedConversations = channels
  .filter(channel => channel.type !== "privateMsg" && channel.joined === false && channel.invited === true)
  .sort((channelA, channelB) => {
    if (!channelA.lastMessage)
      return -1;
    if (!channelB.lastMessage)
      return 1;
    const timeA = new Date(channelA.lastMessage.createdAt).getTime();
    const timeB = new Date(channelB.lastMessage.createdAt).getTime();
    return timeB - timeA;
  })
  .map((channel) => (
    channel ? (
      <ConversationItem
        key={channel.id}
        channel={channel}
        handleClick={handleClickAcceptInvite}
        handleLeave={handleLeave}
        notifMsg={notifMsg}
        isRecentSection={false}
        status={status}
        
      />
    ) : null
  ));

  const recentConversations = channels
  .filter(channel => channel.type !== "privateMsg" && channel.joined === false && channel.invited === false && channel.isBanned === false)
  .sort((channelA, channelB) => {
    if (!channelA.lastMessage)
      return -1;
    if (!channelB.lastMessage)
      return 1;
    const timeA = new Date(channelA.lastMessage.createdAt).getTime();
    const timeB = new Date(channelB.lastMessage.createdAt).getTime();
    return timeB - timeA;
  })
  .map((channel) => (
    channel ? (
      <ConversationItem
        key={channel.id}
        channel={channel}
        handleClick={handleClickJoinRecent}
        handleLeave={handleLeave}
        notifMsg={notifMsg}
        isRecentSection={true}
        status={status}
      />
    ) : null
  ));


  const makeConversationList = (conversations:(React.JSX.Element | null)[], title:string, highlight?:boolean):React.JSX.Element | null => {
    if (!conversations || conversations.length === 0) return null;
    return (
      <>
        {highlight === undefined && <p className={`${styles.tinyTitle}`}>{title}</p>}
        {highlight === true && <p className={`${styles.tinyTitle}`}><FontAwesomeIcon
            icon={faCircleDot}
            className={styles.highlight}
          />&#8201;{title}</p>}
        {conversations}
      </>
    );
  };

  const handleClickNew = () => {
    openDisplay({ button: "new" });
  };

  return (
    <div className={styles.main} style={{ maxWidth: maxWidth }}>
      <SearchBar
        socket={socket}
        openDisplay={openDisplay}
      />

      <div className={styles.title}>
        <h3>Discussions</h3>
        <div className={styles.icons}>
          <FontAwesomeIcon
            icon={faPenToSquare}
            className={styles.menu}
            onClick={handleClickNew}
          />
        </div>
      </div>
      <div className={styles.scroll}>
        {makeConversationList(joinedConversations, "Registered Channels")}
        {makeConversationList(pmConversations, "Private messages")}
        {makeConversationList(recentConversations, "Recent Channels")}
        {makeConversationList(invitedConversations, "Invitations", true)}
      </div>
    </div>
  );
}
