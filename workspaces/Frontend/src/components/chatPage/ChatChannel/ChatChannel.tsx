"use client";

import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css"
import Header from "./Header";
import MessageBoard from "./MessageBoard";
import Prompt from "./Prompt";
import { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { EditChannelRelation } from "@/types/Channel-linked/EditChannelRelation";
import { RelationNotifPack } from "@/types/Channel-linked/RelationNotifPack";
import { RelationNotif } from "@/lib/enums/relationNotif.enum";
import Channel_Service from "@/services/Channel.service";
import { toast } from "react-toastify";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  icon: ReactNode;
  channel: Channel;
  myself: Profile & { avatar: Avatar };
  socket: Socket | undefined;
  status: Map<string, string>;
};

// Fresh Messages listened by websocket
type ReceivedMsg = {
  content: string;
  date: string;
  sender: User;
  channelName: string;
  channelId: number;
  isServerNotif: boolean;
  join?: string;
};

// Previous messages loaded from database
type LoadMsg = {
  content: string;
  createdAt: string;
  user?: User;
  isServerNotif: boolean;
  updatedAt: string;
  join?: string;
};

export default function ChatChannel({ icon, channel, myself, socket, status }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [codeName, setCodename] = useState<string>("");
  const [relNotif, setRelNotif] = useState<RelationNotifPack>({notif:RelationNotif.nothing, edit:undefined});
  const [isMuted, setIsMuted] = useState<boolean>(channel.muted);
  const router = useRouter();

  const getMessages = () => {

    socket?.emit("getMessages", {channelId : channel.id, source:"getMessages"},
      (response: LoadMsg[]) => {
        const previousMsg: Message[] = [];

        response.forEach((item) => {
          const originalDate = new Date(item.createdAt);
          const modifiedDate = new Date(originalDate); // Create a new Date object to avoid mutating the original
    
          const msg: Message = {
            content: item.content,
            sender: item.isServerNotif ? undefined : item.user,
            date: modifiedDate,
            isServerNotif: item.isServerNotif,
            join: item.join,
          };
          previousMsg.push(msg);
        });

    if (channel.type === "privateMsg") {
      socket?.emit("getChannelName", {channelId : channel.id, source:"getChannelName"}, (response: Rep) => {
        if (response.success) {
          setCodename(response.message);
        }
      });
    }
        setMessages(previousMsg);
      }
    );
  }

  const checkThenGetMessages = async () => {
    try {
      const isInto = await isUserstillInChannel();
      if (isInto) {
        getMessages();
      }
    } catch (error:any) {
      if (process.env && process.env.ENVIRONNEMENT &&  process.env.ENVIRONNEMENT === "dev")
        console.error("checkThenGetMessages error :", error.message);
    }
  }

  const isUserstillInChannel = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      socket?.emit("isUserInChannel", { channelId: channel.id, source: "isUserInChannel" }, (isInto: boolean) => {
        resolve(isInto);
      });
    });
  };

  useEffect(() => {
    checkThenGetMessages();

  }, [channel, socket]);

  useEffect(() => { 
	 checkIfMuted();

  }, []);

  const checkIfMuted = async () => {
    try {
      const channelService = new Channel_Service(undefined);
      const rep:ReturnDataTyped<UserRelation> = await channelService.getMyChannelRelation(channel.id);
      
      if (!rep.success) throw new Error(rep.message);

      if (rep.success && rep.data) {
        setIsMuted(rep.data.muted)
      }
    } catch(e:any) {
      if (e.message === "disconnect") {
        await disconnect();
        router.refresh();
        return ;
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("ChatChannel, checkIfMuted() error : ", e.message);
      toast.error("Something went wrong, please try again!");
    }
  }

  const handleEditRelation = (edit:EditChannelRelation) => {
    if (edit !== undefined && edit.userId === myself.id && edit.channelId === channel.id) {
      if (edit.newRelation.isBanned === true)
        setRelNotif({notif:RelationNotif.ban, edit:edit});
      else if ((edit.newRelation.joined === false || (edit.newRelation.invited === false && edit.newRelation.joined !== true)) && edit.senderId !== myself.id)
        setRelNotif({notif:RelationNotif.kick, edit:edit});
      else if ((edit.newRelation.joined === false || (edit.newRelation.invited === false && edit.newRelation.joined !== true)) && edit.senderId === myself.id)
        setRelNotif({notif:RelationNotif.leave, edit:edit});
      else if (edit.newRelation.joined === true || edit.newRelation.isBanned === false)
        setRelNotif({notif:RelationNotif.nothing, edit:edit});
      else if (edit.newRelation.invited === true)
        setRelNotif({notif:RelationNotif.invite, edit:edit});
      else if (edit.newRelation.muted !== undefined)
        setIsMuted(edit.newRelation.muted);
    }

    // update messages (banned or not)
    checkThenGetMessages();
  }

  useEffect(() => {
    
    const clearNotifMsg = () => {
      socket?.emit('clearNotif', {
        which: "messages",
        id: channel.id,
      });
    }

    const handleReceivedMsg = (receivedMsg: ReceivedMsg) => {
      
      setTimeout(() => {
        clearNotifMsg();
      }, 2000);

      // to not display ServerNotifMessage from other channels
      if (receivedMsg.channelId !== channel.id)
        return ;

      const receivedDate = new Date(receivedMsg.date);
      const msg: Message = {
        content: receivedMsg.content,
        sender: receivedMsg.sender,
        date: receivedDate,
        isServerNotif: receivedMsg.isServerNotif,
        join: receivedMsg.join && receivedMsg.join.length > 0
              ? receivedMsg.join
              : undefined,
      };

      setMessages((previous) => [...previous, msg]);
    };

    clearNotifMsg();

    socket?.on("sendMsg", handleReceivedMsg);
    socket?.on("editRelation", handleEditRelation);

    return () => {
      socket?.off("sendMsg", handleReceivedMsg);
      socket?.off("editRelation", handleEditRelation);
    };
    
  }, [channel.name, socket]);

  const addMsg = (msg: Message) => {

    if (process.env && process.env.ENVIRONNEMENT &&  process.env.ENVIRONNEMENT === "dev")
      console.log("Message : ", msg);

    if (msg.opponentId && msg.opponentId !== -1) {
      socket?.emit('getChannelId', msg.opponentId, (payload: number) => {
        if (payload) {
          socket?.emit("forceJoinPrivateMsgChannel", 
          {channelId: payload, source:"forceJoinPrivateMsgChannel"},
          (rep:ReturnData) => {
            if (rep.success) {
                socket?.emit("newMsg", {
                  content: msg.content,
                  channelId: payload,
                  join: msg.join ? msg.join : undefined,
                  source: "newMsg",
                });
              } else {
                toast.error("Something went wrong, please try again!");
              }
          });
        }
      });
      return ;
    }

  // Force receiver's socket(s) to join room if needed
  if (channel.type === "privateMsg") {
    socket?.emit("forceJoinPrivateMsgChannel", 
      {channelId:channel.id, source:"forceJoinPrivateMsgChannel"},
      (rep:ReturnData) => {
        if (rep.success) {
            socket?.emit("newMsg", {
              content: msg.content,
              channelId: channel.id,
              join: msg.join ? msg.join : undefined,
              source: "newMsg",
            });
          } else {
            toast.error("Something went wrong, please try again!");
          }
      });
  } else {
    socket?.emit("newMsg", {
      content: msg.content,
      channelId: channel.id,
      join: msg.join ? msg.join : undefined,
      source: "newMsg",
    });
  }
  };

  return (
    <div className={styles.channelMsgFrame}>
      <Header icon={icon} channel={channel} channelCodeName={codeName} myself={myself} status={status} addMsg={addMsg} />
      <MessageBoard messages={messages} channel={channel} relNotif={relNotif} status={status} myself={myself} addMsg={addMsg} socket={socket} />
      <Prompt channel={channel} myself={myself} addMsg={addMsg} relNotif={relNotif} isMuted={isMuted}/>
    </div>
  );
}
