import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css"
import { RelationNotif } from "@/lib/enums/relationNotif.enum";
import { RelationNotifPack } from "@/types/Channel-linked/RelationNotifPack";
import {
    faCertificate,
    faSkull,
    faHand,
    faHandPeace,
    IconDefinition,
    faPersonThroughWindow,
  } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Profile_Service from "@/services/Profile.service";
import { useEffect, useState } from "react";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
    relNotif: RelationNotifPack;
  };

export default function MessageBoardPopUp({relNotif}:Props) {
    const [senderLogin, setSenderLogin] = useState<string>("------");
    const router = useRouter();

    useEffect(() => {
        async function recupSenderLogin() {
          try {
            if (relNotif.edit === undefined) {
              throw new Error("No data about editRelation");
            }
    
            const profileService = new Profile_Service(undefined);
            const login = (await profileService.getProfileById(relNotif.edit.senderId))?.login;
            setSenderLogin(login);
    
          } catch (e: any) {
            setSenderLogin("");
            if (e.message === 'disconnect') {
              await disconnect();
              router.refresh();
              return ;
            }
          }
        }
    
        recupSenderLogin();
      }, [relNotif]);

    let notifMsg:string = "";
    let iconDef:IconDefinition = faCertificate;
    let iconColor:string = "var(--notif)";
    let linkMessage:string = "go back to home";
    let linkHref:string = "/home";

    switch(relNotif.notif) {
        case RelationNotif.ban:
           notifMsg = "banned you from channel";
           iconDef = faSkull;
           break;
        
        case RelationNotif.kick:
            notifMsg = "kicked you from channel";
            iconDef = faHand;
            break;

        case RelationNotif.leave:
            notifMsg = "You left the channel";
            iconDef = faPersonThroughWindow;
            break;

        case RelationNotif.invite:
            notifMsg = "invited you into channel";
            iconDef = faHandPeace;
            iconColor = "var(--accent1)";
            linkHref = "/home/chat";
            linkMessage = "go to chat main pannel to valid or reject";
            break;

        default:
            notifMsg = "MessageBoardPopUp Component"
            break;
    }

  return (

        <div className={styles.popUp}>
            <p className={styles.icon} style={{color: iconColor}}><FontAwesomeIcon icon={iconDef}/></p>
            {relNotif.edit?.senderId !== relNotif.edit?.userId && <h1 style={{color: "var(--accent1)"}}>{senderLogin}</h1>}
            <h1>{notifMsg}</h1>
            <Link href={linkHref} className={styles.link}>{linkMessage}</Link>
        </div>

  )
}
