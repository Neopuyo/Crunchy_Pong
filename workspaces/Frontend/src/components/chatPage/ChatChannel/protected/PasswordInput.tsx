import disconnect from "@/lib/disconnect/disconnect";
import Channel_Service from "@/services/Channel.service";
import styles from "@/styles/chatPage/ChatChannel/PasswordInput.module.css";
import { EditChannelRelation } from "@/types/Channel-linked/EditChannelRelation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { Socket } from "socket.io-client";

type Props = {
  channel: Channel;
  myself: Profile & { avatar: Avatar };
  socket: Socket | undefined;
  openDisplay: (display: Display) => void;
}

export default function PasswordInput({channel, myself, socket, openDisplay}: Props) {

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedPassword, setEditedPassword] = useState<string>("");
  const [notif, setNotif] = useState<string>("");
  const router = useRouter();

  const handleEditedPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditedPassword(event.target.value);
  };

  const handleClickEdit = () => {
    setEditMode(true);
  };

  const afterVerifyPassword = async () => {

    try {
      const newRelation:EditChannelRelation = {
        channelId: channel.id,
        userId: myself.id,
        senderId: myself.id,
        newRelation: {
          joined: true,
          invited:false,
        }
      }

      const channelService = new Channel_Service(undefined);
      const rep = await channelService.editRelation(channel.id, myself.id, newRelation.newRelation);

      if (rep.success) {
          socket?.emit("editRelation", newRelation, (repNotif:ReturnData) => {
            if (repNotif.success) {
              openDisplay({...channel, needPassword:false })
            } else {
              setNotif(repNotif.message ? repNotif.message : "An error occured, please try again later");
            }
          });
      } else {
        if (rep.message === 'disconnect') {
          await disconnect();
          router.refresh();
          return ;
        }
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log("afterVerifyPassword => error (object) : ", rep.error);
        throw new Error(rep.message); 
    }


    } catch(error:any) {
      setNotif(error.message ? error.message : "An error occured, please try again later");
    }
  }

   const handleVerifyPassword = async (event: any) => {
    event.preventDefault();

    try {
      const submitedPassword:string = event.target.password.value;

      socket?.emit("verifyChannelPassword", 
        {
          channelId: channel.id,
          password: submitedPassword,
        }, 
        (rep:ReturnData) => {
          if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
            console.log("verifyPassword => REP : ", rep);
          if (rep.success) {
            setNotif("");
            afterVerifyPassword();
          } else {
            if (rep.message && rep.message !== "")
              setNotif(rep.message);
            else
              setNotif("An error occured, please try again later");
          }
        })
    } catch(error:any) {
      setNotif(error.message ? error.message : "An error occured, please try again later");
    }
    setEditMode(false);
  }


  if (!editMode) {
    return ( 
    <div className={styles.card}>
      <p className={styles.notif}>{notif}</p>
      <div onClick={handleClickEdit}>
        <p className={styles.password + " " + styles.placeholder}>
          {" "}enter password{" "}
        </p>
      </div>
    </div>);

  } else {
    return (
    <div className={styles.card}>
      <p className={styles.notif}>{notif}</p> 
      <form onSubmit={handleVerifyPassword} className={styles.form}>
          <p className={styles.password}>
            {" "}
            <input
              type="text"
              name="password"
              maxLength={20}
              value={editedPassword}
              placeholder="enter password"
              onChange={handleEditedPasswordChange}
              autoFocus
              id="passwordInput"
            />
          </p>
          <button className={styles.button_type1} type="submit">
            submit
          </button>
        </form>
    </div>);
  }
  

}

