import disconnect from "@/lib/disconnect/disconnect";
import fetchClientSide from "@/lib/fetch/fetchClientSide";
import styles from "@/styles/profile/TfaComponent.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export default function PopupDeactivate({
	closePopup,
	setCode,
	notifPopup,
	setNotifPopup,
	code,
	setTfa,
	setPopup3,
	profile,

}: {
	closePopup: () => void;
	setCode: Dispatch<SetStateAction<string>>;
	notifPopup: string;
	setNotifPopup: Dispatch<SetStateAction<string>>;
	code: string;
	setTfa: Dispatch<SetStateAction<boolean>>;
	setPopup3: Dispatch<SetStateAction<boolean>>;
	profile: Profile;
}) {
	const	router = useRouter();
	
	const	deactivateCode2fa = async () => {
		setNotifPopup('');

		if (code.length !== 6) {
			setNotifPopup("The code should have six characters");
			return ;
		}

		try {
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/deactivate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					twoFactorAuthenticationCode: code.toUpperCase(),
				}),
			});

			if (!res.ok)
				throw new Error('error fetch');
			
			const	data = await res.json()

			if (!data.success && data.error == 'wrong code') {
				setNotifPopup('Wrong Authentification Code');
				return ;
			}

			setTfa(false);
			profile.isTwoFactorAuthenticationEnabled = false;
			setPopup3(false);
		}
		catch (error: any) {
			if (error.message === "disconnect") {
				await disconnect();
				router.refresh();
				return ;
			}
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
			setNotifPopup('Something went wrong, please try again!');
		}
	}

	return (
		<div className={styles.popup2}>
		<div className={styles.icon}>
			<FontAwesomeIcon
				icon={faXmark}
				style={{width:"100%", height:"100%"}}
				onClick={closePopup}
			/>
		</div>
		<p>
			Please enter the code generated in the authentification application in your phone.
		</p>
		<input
			type="text"
			name="code"
			maxLength={6}
			minLength={6}
			onChange={(e) => {
				setCode(e.target.value);
			}}
		/>
		<div className={styles.line}></div>
		<button className={styles.activate} onClick={deactivateCode2fa}>
			Deactivate
		</button>
		{
			notifPopup.length > 0 &&
			<div className={styles.notif}>{notifPopup}</div>
		}
		</div>
	);
}
