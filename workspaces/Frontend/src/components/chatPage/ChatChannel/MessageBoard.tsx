import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css"
import MessageItem from "./MessageItem";
import { useEffect, useState } from "react";
import { RelationNotifPack } from "@/types/Channel-linked/RelationNotifPack";
import { RelationNotif } from "@/lib/enums/relationNotif.enum";
import MessageBoardPopUp from "./MessageBoardPopUp";
import { Socket } from "socket.io-client";

type Props = {
  messages: Message[];
  channel: Channel;
  relNotif: RelationNotifPack;
  status: Map<string, string>;
  myself: Profile & { avatar: Avatar };
  addMsg: (msg: Message) => void;
  socket: Socket | undefined;
};

export default function MessageBoard({ messages, channel, relNotif, status, myself, addMsg, socket }: Props) {
  const [groupedMessages, setGroupedMessages] = useState<
    GroupedMsgType[]
  >([]);

  useEffect(() => {
    joiningMessages();
  }, [messages]);

  const isSameSender = (senderA: User | undefined, senderB: User | undefined) => {
    if (!senderA || !senderB)
      return false;
    return senderA.id === senderB.id;
  };

  const isWithinTwoMinutes = (dateA: Date, dateB: Date) => {

    if (!(dateA instanceof Date) || !(dateB instanceof Date)) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev") {
        console.log("invalid date object");
        console.log("dateA : ", dateA);
        console.log("dateB : ", dateB);
      }
      return false;
    }

    const diffMilliseconds = Math.abs(dateA.getTime() - dateB.getTime());
    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    return diffMinutes < 2;
  };

  const placeholder:string = channel.type === "privateMsg" ? "Feel free to say hello :D !" : " The channel is empty, start here a new passionating topic !";
  
  const joiningMessages = () => {
    const join: any[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const currentMsg = messages[i];
      const lastGroup = join[join.length - 1];

      if (
        lastGroup &&
        isSameSender(currentMsg.sender, lastGroup.user) &&
        isWithinTwoMinutes(currentMsg.date, lastGroup.date) &&
        !currentMsg.join
      ) {
        lastGroup.messages.unshift(currentMsg);
      } else {
        join.push({
          user: currentMsg.isServerNotif ? undefined : currentMsg.sender,
          date: currentMsg.date,
          messages: [currentMsg],
          isServerNotif: currentMsg.isServerNotif,
          join: currentMsg.join,
        });
      }
    }

    setGroupedMessages(join);
  };

  // Ban, Kick while inside channel management
  if (relNotif.notif !== RelationNotif.nothing) {
    return (
          <MessageBoardPopUp relNotif={relNotif} />
    );
  }

  return (
    <div className={styles.msgBoard}>
      {messages.length > 0 && groupedMessages.map((group, index) => (
        <MessageItem key={index} groupedMessages={group} status={status} myself={myself} addMsg={addMsg} channel={channel} socket={socket} messages={messages} />
      ))}
	  {messages.length === 0 && <p className={styles.placeholder}>{placeholder}</p>}
    </div>
  );
}
