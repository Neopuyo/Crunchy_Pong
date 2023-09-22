import styles from "@/styles/profile/InfoCard.module.css";
import { Dispatch, SetStateAction, useState } from "react";
import { Socket } from "socket.io-client";
import {
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditPassword from "./EditPassword";
import ResumeChannel from "./ResumeChannel";

type Props = {
  relation: ChannelUsersRelation;
  socket: Socket | undefined;
};

export default function SectionCustomChannel({
  relation,
  socket,
}: Props) {

  const [notif, setNotif] = useState<string>("");
  const [channelType, setChannelType] = useState<ChannelType>(relation.channel.type);
  const [password, setPassword] = useState<string>(relation.channel.password);

  const pack :{
    relation: ChannelUsersRelation;
    notif: string,
    setNotif: Dispatch<SetStateAction<string>>,
    channelType: ChannelType,
    setChannelType: Dispatch<SetStateAction<ChannelType>>,
    password:string,
    setPassword: Dispatch<SetStateAction<string>>,
  } = {
    relation: relation,
    notif: notif,
    setNotif: setNotif,
    channelType: channelType,
    setChannelType: setChannelType,
    password: password,
    setPassword: setPassword,
  }

  const emitEditChannelType = (type:ChannelType, onSuccess: ()=>void, onFail: ()=>void) => {
    socket?.emit("editChannelType", 
      {
        channelId: relation.channel.id,
        type: type,
      },
      (rep:ReturnData) => {
        if (rep.success)
          onSuccess()
        else
          onFail()
      }
    )
  }

  const handleSwitchPublicPrivate = (type:ChannelType) => {

    emitEditChannelType(type,
        () => {
          if (channelType === "public" || channelType === "protected") {
            setChannelType("private");
          } else if (channelType === "private") {
            setChannelType("public");
          }
        },
        () => {
          setNotif("error switching public/private try later please");
        },
     )
  };

  
  const makeChannelTypeButton = (type:ChannelType, name:string, onClick:(type:ChannelType) => void):JSX.Element => {
    const handleClick = () => {
      if ((type === "public" || "private") && type !== channelType) {
          onClick(type)
        }
    };

    const getButtonStatus = ():boolean => {
      if (type === "public")
      return (channelType === "public" || channelType === "protected");
      else
      return (type === channelType);
    }
    
    return (
      <div className={`${styles.button} ${getButtonStatus() ? styles.active : styles.inactive}`}
      onClick={handleClick}>
        {name}
      </div>
    );
  }
  
  
  const handleSwitchLock = (locked:boolean) => {

    if (locked) {
      if (password !== "") {
      emitEditChannelType("protected",
        () => {
          setChannelType("protected");
          setNotif("");
        },
        () => {
          setNotif("error passing channel as protected try later please");
        },
     )
      } else {
        setNotif("Set a password before locking channel");
      }
    }
    else if (!locked) {
      emitEditChannelType("public",
        () => {
          setChannelType("public");
          setNotif("");
        },
        () => {
          setNotif("error passing channel as public try later please");
        },
     )
    }
  }
  
  const makeLockButton = (locked:boolean, onClick:(locked:boolean) => void, displayIt:boolean):JSX.Element => {

    const handleClick = () => {
      if ((channelType === "public" && locked) || (channelType === "protected" && !locked)) {
        onClick(locked)
      }
    };

    const getButtonStatus = ():boolean => {
       if ((locked && channelType === "protected" ) || (!locked && channelType !== "protected"))
          return true;
       return false;
     }

    if (!displayIt) {return (<></>);}

    return (
      <div className={`${styles.button} ${getButtonStatus() ? styles.active : styles.inactive}`}
           onClick={handleClick}>
        {<FontAwesomeIcon icon={locked ? faLock : faLockOpen}/>}
      </div>
    );
  }

  return (
    <div className={styles.sections}>
      <p className={`${styles.tinyTitle} ${styles.marginTop}`}>{relation.channel.name}</p>
      <ResumeChannel type={channelType} />

      <p className={`${styles.tinyTitle} ${styles.marginTop}`}>Channel type</p>
          {makeChannelTypeButton("public", "Public", handleSwitchPublicPrivate)}
          {makeChannelTypeButton("private", "Private", handleSwitchPublicPrivate)}
      
      { (channelType === "public" || channelType === "protected") && 
        <p className={`${styles.tinyTitle} ${styles.marginTop}`}>Protected by Password</p>
      }
          {makeLockButton(false, handleSwitchLock, channelType !== "private")}
          {makeLockButton(true, handleSwitchLock, channelType !== "private")}
        
      { channelType !== "private" && 
        <EditPassword pack={pack} socket={socket} />
      }
    </div>
  )
}
