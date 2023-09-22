import styles from "@/styles/profile/TfaComponent.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PopupCodeEmail({
	closePopup,
	notifPopup,
	downloadCodes,
}: {
	closePopup: () => void;
	notifPopup: string;
	downloadCodes: () => void;
}) {
	return (
		<div className={styles.popup2}>
		<div className={styles.icon}>
			<FontAwesomeIcon
				icon={faXmark}
				style={{width:"100%", height:"100%"}}
				onClick={closePopup}
			/>
		</div>
		<h4>
			Here what you can do if you loose your authentification application!
		</h4>
		<p>
			Download your backup codes!
		</p>
		<p>
			Without them you could definitely loose your account!
		</p>
		<button className={styles.activate} onClick={downloadCodes}>
			Download my codes
		</button>

		{
			notifPopup.length > 0 &&
			<div className={styles.notif}>{notifPopup}</div>
		}

		</div>
	);
}
