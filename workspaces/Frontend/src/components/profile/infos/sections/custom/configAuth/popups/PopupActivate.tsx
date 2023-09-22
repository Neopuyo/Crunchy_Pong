import disconnect from "@/lib/disconnect/disconnect";
import fetchClientSide from "@/lib/fetch/fetchClientSide";
import styles from "@/styles/profile/TfaComponent.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import QRCode from "react-qr-code";

export default function PopupActivate({
	closePopup,
	otpauthUrl,
	secret,
	setCode,
	notifPopup,
	setNotifPopup,
	code,
	setTfa,
	setPopup2,
	setPopup4,
	profile,
}: {
	closePopup: () => void;
	otpauthUrl: string;
	secret: string;
	setCode: Dispatch<SetStateAction<string>>;
	notifPopup: string;
	setNotifPopup: Dispatch<SetStateAction<string>>;
	code: string;
	setTfa: Dispatch<SetStateAction<boolean>>;
	setPopup2: Dispatch<SetStateAction<boolean>>;
	setPopup4: Dispatch<SetStateAction<boolean>>;
	profile: Profile;
}) {

	const	router = useRouter();

	const	activateCode2fa = async () => {
		setNotifPopup('');

		if (code.length !== 6) {
			setNotifPopup("The code should have six characters");
			return ;
		}

		try {
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/activate`, {
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

			setTfa(true);
			profile.isTwoFactorAuthenticationEnabled = true;
			setPopup2(false);
			setPopup4(true);
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
				Download an authentification application like <span>Authy</span> or <span>Google Authenticator</span> on your phone.
			</p>
			<p>
				Open the app and scan this QR Code!
			</p>
			<div className={styles.qrcode}>
				<QRCode
					style={{ height: "auto", maxWidth: "100%", width: "100%" }}
					value={otpauthUrl}
				/>
			</div>
			<p>
				Or enter this A2F key manually:
			</p>
			<p>{secret}</p>
			<p>
				Now you can securely connect with your phone!
			</p>
			<p>
				Enter here the authentification code that was generated in the app:
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
			<button className={styles.activate} onClick={activateCode2fa}>
				Activate
			</button>

			{
				notifPopup.length > 0 &&
				<div className={styles.notif}>{notifPopup}</div>
			}

		</div>
	);
}
