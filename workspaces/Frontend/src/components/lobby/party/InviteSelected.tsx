import AvatarUser from "@/components/avatarUser/AvatarUser";
import chooseColorStatus from "@/lib/colorStatus/chooseColorStatus";
import styles from "@/styles/lobby/party/DefineField.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Tooltip } from "@mui/material";
import { MutableRefObject, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface StatusData {
	[key: string]: string;
}

export default function InviteSelected({
	invitation,
	closeInvite,
	socket,
	connected,
}: {
	invitation: Pongie | Channel;
	closeInvite: () => void;
	socket: Socket | undefined;
	connected: MutableRefObject<boolean>;
}) {

	const	[color, setColor] = useState<string>("#edf0f0");
	const	[textStatus, setTextStatus] = useState<string>("disconnected");

	const badgeStyleStatus = {
		"& .MuiBadge-badge": {
			backgroundColor: color,
			border: "1px solid var(--tertiary1)",
			width: "12px",
			height: "12px",
			borderRadius: "100%",
		}
	}

	useEffect(() => {

		const updateStatus = (payload: StatusData) => {
			if (payload) {
				const	statusMap = new Map(Object.entries(payload));

				if (statusMap.size > 0) {
					if (statusMap.has(invitation.id.toString())) {
						const	text = statusMap.get(invitation.id.toString()) as string;
						setTextStatus(text);
						setColor(chooseColorStatus(text));
						if (text === 'connected')
							connected.current = true;
						else
							connected.current = false;
					}
				}
			}
		};

		const	getStatus = () => {
			socket?.emit("getStatus", (payload: StatusData) => {
				updateStatus(payload);
			});
		}
	
		getStatus();

		socket?.on("updateStatus", updateStatus);
	
		return () => {
		  socket?.off("updateStatus", updateStatus);
		};
	}, [socket]);

	// if pongie
	if ('login' in invitation)
		return (
			<div className={styles.selected} >
				<Tooltip title={textStatus} placement="left" arrow>
					<Badge
						overlap="circular"
						sx={badgeStyleStatus}
						variant="dot"
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "right",
						}}
					>
						<div className={styles.avatar}>
							<AvatarUser
								avatar={invitation.avatar}
								borderSize="3px"
								borderColor={invitation.avatar.borderColor}
								backgroundColor={invitation.avatar.backgroundColor}
								fontSize="1rem"
							/>
						</div>
					</Badge>
				</Tooltip>

				<div className={styles.login} style={{color: invitation.avatar.borderColor}}>
					<h4>{invitation.login}</h4>
				</div>

				<div className={styles.right}>
					<FontAwesomeIcon
						icon={faXmark}
						className={styles.icon}
						onClick={closeInvite}
					/>
				</div>

			</div>
		)
	
	// else channel
	return (
		<div className={styles.selected} >
			<div className={styles.avatar}>
				<AvatarUser
					avatar={invitation.avatar}
					borderSize="3px"
					borderColor={invitation.avatar.borderColor}
					backgroundColor={invitation.avatar.backgroundColor}
					fontSize="1rem"
				/>
			</div>

			<div className={styles.login} style={{color: invitation.avatar.borderColor}}>
				<h4>{invitation.name}</h4>
			</div>

			<div className={styles.right}>
				<FontAwesomeIcon
					icon={faXmark}
					className={styles.icon}
					onClick={closeInvite}
				/>
			</div>

		</div>
	);
}
