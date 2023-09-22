import fetchClientSide from "@/lib/fetch/fetchClientSide";
import styles from "@/styles/profile/TfaComponent.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PopupCodeEmail from "./popups/PopupCodeEmail";
import PopupActivate from "./popups/PopupActivate";
import PopupDeactivate from "./popups/PopupDeactivate";
import PopupDownloadCodes from "./popups/PopupDownloadCodes";
import disconnect from "@/lib/disconnect/disconnect";

export default function SectionCustom({ profile }: {
	profile: Profile,
}) {

	const	router = useRouter();
	const	[notif1, setNotif1] = useState<string>('');
	const	[notif2, setNotif2] = useState<string>('');
	const	[notifPopup, setNotifPopup] = useState<string>('');
	const	[code, setCode] = useState<string>('');
	const	[popup1, setPopup1] = useState<boolean>(false);
	const	[popup2, setPopup2] = useState<boolean>(false);
	const	[popup3, setPopup3] = useState<boolean>(false);
	const	[popup4, setPopup4] = useState<boolean>(false);
	const	[popup5, setPopup5] = useState<boolean>(false);
	const	[tfa, setTfa] = useState<boolean>(profile.isTwoFactorAuthenticationEnabled ? profile.isTwoFactorAuthenticationEnabled : false);
	const	[secret, setSecret] = useState<string>("");
	const	[otpauthUrl, setOtpauthUrl] = useState<string>("");

	const	activate2fa = async () => {
		setNotif1('');
		setNotifPopup('');

		if (!popup1) {
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/sendCode`);

			if (!res.ok)
				throw new Error("fetch error");
			
			setPopup1(true);
			return ;
		}

		if (popup1) {
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/verifyCode`, {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code: code.toUpperCase()
				}),
			});

			if (!res.ok)
				throw new Error('error fetch');

			const	data = await res.json();

			if (!data.success) {
				if (data.error === "wrong code")
					setNotif1("This code was not found, a new one has been sent to you!")
				if (data.error === "time out")
					setNotif1("This code has expired, a new one has been sent to you!")
				return ;
			}

			setPopup1(false);

			const	resGenerate = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/generate`);

			if (!resGenerate.ok)
				throw new Error("fetch error");

			const	dataGenerate = await resGenerate.json();
			
			setSecret(dataGenerate.secret);
			setOtpauthUrl(dataGenerate.otpauthUrl);
			setPopup2(true);
			setCode('');
		}
	}

	const	deactivate2fa = async () => {
		setPopup3(true);
	}

	const	handleDoubleAuth = async () => {
		setNotif1('');
		setNotifPopup('');

		try {
			if (!tfa)
				await activate2fa();
			else
				await deactivate2fa();
		}
		catch (error: any) {
			if (error.message === "disconnect") {
				await disconnect();
				router.refresh();
				return ;
			}
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
			setNotif1('Something went wrong, please try again!');
			setNotifPopup('Something went wrong, please try again!');
		}
	}

	const	closePopup = () => {
		setPopup2(false);
		setPopup3(false);
		setPopup4(false);
	}

	const	downloadCodes = async () => {
		setNotif2('');
		setNotifPopup('');

		try {
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/backupCodes`);

			if (!res.ok)
				throw new Error('fetch failed');
				
			const	data: string[] = await res.json();

			let	text = "Here are your backup authentification codes for your Crunchy account!\nWithout them you won't be able to log in to your account anymore if you loose your authentification application!\n- ";
			text = text += data.join('\n- ');

			const	blob = new Blob([text], { type: 'text/plain' });
			const	url = URL.createObjectURL(blob);
			const	a = document.createElement('a');

			a.href = url;
			a.download = 'crunchy_backup_codes.txt';
			a.click();
			URL.revokeObjectURL(url);

			setPopup4(false);
			setPopup5(false);
		}
		catch (error: any) {
			if (error.message === "disconnect") {
				await disconnect();
				router.refresh();
				return ;
			}
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
			setNotif2('Something went wrong, please try again!');
			setNotifPopup('Something went wrong, please try again!');
		}
	}

	const	verifyAuthCode = async () => {
		
		setNotif2("");
		setNotifPopup('');

		if (code.length !== 6) {
			setNotif2("The code should have six characters");
			return ;
		}

		try {
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/2fa/verifyAuthCode`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					twoFactorAuthenticationCode: code,
				}),
			})

			if (!res.ok)
				throw new Error('fetch failed');

			const	data = await res.json();

			if (!data.success && data.error === 'wrong code') {
				setNotif2('Wrong Authentification Code');
				return ;
			}

			if (data.success) {
				setPopup4(true);
				return ;
			}
			
			throw new Error('no success data');

		}
		catch (error: any) {
			if (error.message === "disconnect") {
				await disconnect();
				router.refresh();
				return ;
			}
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
			setNotif2('Something went wrong, please try again!');
			setNotifPopup('Something went wrong, please try again!');
		}
	}

	return (
		<div className={styles.main}>
			<p>
				Protect your Crunchy account with an extra layer of security. Once set up, you will need to enter both your password and an authentication code from your phone to log in.
			</p>

			{
				popup1 &&
				<PopupCodeEmail setCode={setCode} />
			}

			<div className={styles.flexButtons}>
				<button
					onClick={handleDoubleAuth}
					className={styles.button}
				>
					{
						popup1
						? "Send code"
						: tfa
						? "Deactivate Double Authentification"
						: "Activate Double Authentification"
					}
				</button>
				{
					popup1 &&
					<button onClick={() => setPopup1(false)} className={styles.button}>
						Cancel
					</button>
				}
			</div>

			{
				notif1.length > 0 &&
				<p className={styles.notif}>{notif1}</p>
			}

			{
				popup2 &&
				<PopupActivate
					closePopup={closePopup}
					otpauthUrl={otpauthUrl}
					secret={secret}
					setCode={setCode}
					notifPopup={notifPopup}
					setNotifPopup={setNotifPopup}
					code={code}
					setTfa={setTfa}
					setPopup2={setPopup2}
					setPopup4={setPopup4}
					profile={profile}
				/>
			}

			{
				popup3 &&
				<PopupDeactivate
					closePopup={closePopup}
					setCode={setCode}
					notifPopup={notifPopup}
					setNotifPopup={setNotifPopup}
					code={code}
					setTfa={setTfa}
					setPopup3={setPopup3}
					profile={profile}
				/>
			}

			{
				popup4 &&
				<PopupDownloadCodes
					closePopup={closePopup}
					notifPopup={notifPopup}
					downloadCodes={downloadCodes}
				/>
			}

			{
				tfa &&
				<div className={styles.backupCodes}>
					<p>
						Your backup codes are the only way to get back your account if you loose your authentification application. Keep them safe!
					</p>
					<button onClick={() => setPopup5(!popup5)} className={styles.button}>
						Download my backup codes
					</button>
				</div>
			}

			{
				popup5 &&
				<div className={styles.popup5}>
					<p>Please enter the code generated in your authentification application:</p>
					<input
						type="text"
						name="code"
						maxLength={6}
						minLength={6}
						onChange={(e) => {
							setCode(e.target.value);
						}}
					/>
					<button className={styles.activate} onClick={verifyAuthCode}>
						Verify
					</button>
					{
						notif2.length > 0 &&
						<div className={styles.notif}>{notif2}</div>
					}
				</div>
			}

		</div>
	)
}
