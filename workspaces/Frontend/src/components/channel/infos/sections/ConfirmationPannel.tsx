import { confSentences } from "@/lib/enums/ConfirmationSentences.enum";
import styles from "@/styles/profile/InfoCard.module.css";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  handleValidate: () => void;
  handleCancel: () => void;
  confirmationList: ConfirmationList;
  relation: UserRelation;
};

export default function ConfirmationPannel({
  handleValidate,
  handleCancel,
  confirmationList,
  relation,
}: Props) {

 const makeConf = ():string => {
	switch(confirmationList) {

		case "boss":
		return relation.isBoss ? confSentences.rmBoss : confSentences.giveBoss

		case "chanOp":
		return relation.isChanOp ? confSentences.rmChanOp : confSentences.giveChanOp;

		case "kick":
		return relation.invited ? confSentences.rmInvite : confSentences.kick;

		case "ban":
		return relation.isBanned ? confSentences.rmBan : confSentences.giveBan;

		case "invite":
		return confSentences.giveInvite;

		case "mute":
		return relation.muted ? confSentences.rmMute : confSentences.giveMute;

		case "nothing":
		return "";

		default:
		return "";
	}
 }

  return <div className={styles.confirmationPannel}>
	<pre className={styles.vctext}>{makeConf()}</pre>
	<FontAwesomeIcon className={styles.vcbutton} onClick={handleCancel} icon={faXmark} style={{color : "var(--notif)"}} />
	<FontAwesomeIcon className={styles.vcbutton} onClick={handleValidate} icon={faCheck} style={{color : "var(--accent1)"}} />
	</div>;
}
