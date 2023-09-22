import { ReactNode, useState } from "react";
import { Socket } from "socket.io-client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/chatPage/displayInfos/DisplayInfos.module.css";
import { toast } from "react-toastify";

export default function DisplayInfos({
	icon,
	socket,
	openDisplay,
}: {
	icon: ReactNode;
	socket: Socket | undefined;
	openDisplay: (display: Display) => void;
}) {

	const	textButtonInitial = "Validate";
	const	[password, setPassword] = useState<string>("");
	const	[openPassword, setOpenPassword] = useState<boolean>(false);
	const	[type, setType] = useState<string>("public");
	const	[name, setName] = useState<string>("");
	const	[textButton, setTextButton] = useState<string>(textButtonInitial);
  

	const	chooseType = (text: string) => {
		if (text === "protected")
			setType('protected');
		else if (text === "private") {
			setType('private');
			setOpenPassword(false);
			setPassword("");
		}
		else {
			setType("public");
			setOpenPassword(false);
			setPassword("");
		}
	}
  
	const	createChannel = () => {
		setTextButton("Loading...");

		if (!name || name.length === 0) {
			toast.info("Please enter a name!");
			setTextButton(textButtonInitial);
			return ;
		}

		if (type === "protected" && (!password || password.length === 0)) {
			toast.info("Please enter a password or choose a public channel!");
			setTextButton(textButtonInitial);
			return ;
		}

		try {
			socket?.emit('join', {
				id: -1,
				channelName: name,
				channelType: type === "protected"
							? "protected"
							: type === "private"
							? "private"
							: "public",
				password: type === "protected" ? password : undefined,
				isCreation: true,
			}, (payload: {
				success: boolean;
				exists: boolean;
				banned: boolean;
				channel: Channel;
			  }) => {
				if (!payload)
					throw new Error('no payload');
				if (payload.success)
					openDisplay(payload.channel);
				else if (payload.exists) {
					toast.error('This channel already exists');
					toast.info('Please choose an other name');
					setTextButton(textButtonInitial);
				}
				else
					throw new Error('error payload');
			});
		}
		catch (error: any) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
			toast.error('Somethigng went wrong, please try again!')
			setTextButton(textButtonInitial);
		}
	}
  
	return (
		<div className={styles.main}>
			<div className={styles.header}>
					{icon}
					<h3>Create a new channel!</h3>
					<div></div>
			</div>

			<p>What&apos;s its name? 🖋️</p>

			<input
				type='text'
				placeholder="name..."
				maxLength={100}
				name="channelName"
				onChange={(e) => setName(e.currentTarget.value)}
			/>

			<div className={styles.type}>
				<p>This channel is </p>
				<p><span>{type}</span></p>
			</div>
		
			<p className={styles.tinyTitle}>Channel type:</p>

			<div className={styles.choose}>
				<div
					className={
						type === "public" ? `${styles.button} ${styles.selected}` : styles.button
					}
					onClick={() => chooseType("public")}
				>Public</div>
				<div
					className={
						type === "private" ? `${styles.button} ${styles.selected}` : styles.button
					}
					onClick={() => chooseType("private")}
				>Private</div>
			</div>

			{
				type !== "private" &&
				<>
					<p className={styles.tinyTitle}>Protected by Password:</p>
					<div className={styles.icons}>
						<FontAwesomeIcon
							icon={faLockOpen}
							className={styles.icon}
							onClick={() => {
								setType('public');
								setOpenPassword(false);
							}}
							style={{
								color: type === "public"
									? "var(--accent1)"
									: "var(--tertiary1)"
							}}
						/>
						<FontAwesomeIcon
							icon={faLock}
							className={styles.icon}
							onClick={() => {
								setType('protected');
								setOpenPassword(true);
							}}
							style={{
								color: type === "protected"
									? "var(--accent1)"
									: "var(--tertiary1)"
							}}
						/>
					</div>
				</>
			}

			{
				openPassword &&
				<input
					type='text'
					placeholder="password..."
					maxLength={20}
					onChange={(e) => setPassword(e.currentTarget.value)}
				/>
			}

			<button
				type='button'
				onClick={() => createChannel()}
			>
				{textButton}
			</button>
		</div>	
	)
}
