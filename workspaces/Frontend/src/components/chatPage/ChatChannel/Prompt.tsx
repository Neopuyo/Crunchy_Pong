import { RelationNotif } from "@/lib/enums/relationNotif.enum";
import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css"
import { RelationNotifPack } from "@/types/Channel-linked/RelationNotifPack";
import { faPaperPlane, faXmarkSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

type Props = {
  channel: Channel;
  myself: User;
  addMsg: (msg: Message) => void;
  relNotif: RelationNotifPack;
  isMuted: boolean;
};

export default function Prompt({ channel, myself, addMsg, relNotif, isMuted}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    adjustHeight();
    if (text.length === 1 && text[0] === "\n") {
      setText("");
      setIsEmpty(true);
      if (textareaRef.current) textareaRef.current.style.height = "40px";
    }
  }, [text]);

  const junctionWord = channel.type === "privateMsg" ? "at " : "into ";

  const truncatedName = channel.name.length > 12 ? `${channel.name.slice(0, 5)}...` : channel.name;

  const placeholder = "Send a message " + junctionWord + truncatedName;

  const buttonAddedClass = isEmpty
    ? styles.disabledButton
    : styles.activeButton;

  const handleSendMsg = (e: React.FormEvent | null) => {
    e?.preventDefault();

    if (text.length > 0 && relNotif.notif === RelationNotif.nothing && !isMuted) {
      const newMsg: Message = {
        content: text,
        sender: myself,
        date: new Date(),
        isServerNotif: false
      };

      addMsg(newMsg);
    }

    setText("");
    setIsEmpty(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsEmpty(e.target.value === "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMsg(null);
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        600
      )}px`;
    }
  };

  return (
    <div className={styles.prompt}>
      <form onSubmit={handleSendMsg}>
        <textarea
          name="prompt"
          ref={textareaRef}
          placeholder={placeholder}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          value={text}
          maxLength={350}
        />
        <button
          className={`${styles.paperPlane} ${buttonAddedClass}`}
          type="submit"
        >
          <FontAwesomeIcon icon={isMuted ? faXmarkSquare : faPaperPlane} style={{color: isMuted? "var(--notif)" : ""}}/>
        </button>
      </form>
    </div>
  );
}
