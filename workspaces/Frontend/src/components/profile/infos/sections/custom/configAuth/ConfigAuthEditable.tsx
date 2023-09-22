import stylesInfoCard from "@/styles/profile/InfoCard.module.css";
import TfaComponent from "./TfaComponent";
import styles from "@/styles/profile/TfaComponent.module.css";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ChangeLogin from "./ChangeLogin";
import ChangePassword from "./ChangePassword";
import { Socket } from "socket.io-client";

export default function ConfigAuthEditable({ profile, setLogin, socket }: {
	profile: Profile;
	setLogin: Dispatch<SetStateAction<string>>;
	socket: Socket | undefined;
}) {

	const	[changeLogin, setChangeLogin] = useState<boolean>(false);
	const	[changePassword, setChangePassword] = useState<boolean>(false);

	return (
		<>
			<p className={stylesInfoCard.tinyTitle}>Account Settings</p>
			
			{
				!changeLogin &&
				<button
					className={styles.button}
					style={{margin:"10px auto"}}
					onClick={() => setChangeLogin(true)}
				>Change my login</button>
			}

			{
				changeLogin &&
				<ChangeLogin
					setChangeLogin={setChangeLogin}
					setLogin={setLogin}
					socket={socket}
				/>
			}

			{
				profile.provider && profile.provider === "email" && !changePassword &&
				<button
					className={styles.button}
					style={{margin:"10px auto"}}
					onClick={() => setChangePassword(true)}
				>Change my password</button>
			}

			{
				changePassword &&
				<ChangePassword
					setChangePassword={setChangePassword}
				/>
			}

			<TfaComponent profile={profile}/>

		</>
	)
}
