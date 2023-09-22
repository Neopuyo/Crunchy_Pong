import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import styles from "@/styles/profile/Pongies/SectionPongies.module.css";
import AvatarUser from "@/components/avatarUser/AvatarUser";
import PongieFooter from "../footerOptions/PongieFooter";
import { Badge, Tooltip } from "@mui/material";
import chooseColorStatus from "@/lib/colorStatus/chooseColorStatus";

const badgeStyle = {
	"& .MuiBadge-badge": {
		backgroundColor: 'var(--notif)',
		border: "1px solid var(--tertiary1)",
		width: "12px",
		height: "12px",
		borderRadius: "100%",
	}
}

export default function PongieList({pongie, socket, crossFunction, notifsIds, setNotifIds, status}: {
	pongie: Pongie;
	socket: Socket | undefined;
	crossFunction: (pongie: Pongie) => void;
	notifsIds: number[];
	setNotifIds: React.Dispatch<React.SetStateAction<number[]>>;
	status: Map<string, string>;
}) {
	const	[isFocused, setIsFocused] = useState<boolean>(false);
	const	[invisible, setInvisible] = useState<boolean>(true);
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
		const	match = notifsIds.find(id => id === pongie.id);

		if (match && invisible)
			setInvisible(false);
		if (!match && !invisible)
			setInvisible(true);

		if (status && status.size > 0) {
			if (status.has(pongie.id.toString())) {
				const	text = status.get(pongie.id.toString()) as string;
				setTextStatus(text);
				setColor(chooseColorStatus(text));
			}
		}
		
	}, [notifsIds, status]);

	const handleFocusOn = () => {
		setIsFocused(true);
		setInvisible(true);

		const	id = notifsIds.find(id => id === pongie.id);

		if (id) {
			const	ids = notifsIds.filter(id => id !== pongie.id);
			setNotifIds(ids);
			
			socket?.emit("clearNotif", {
				which: "redPongies",
				id: pongie.id,
			});
		}
	};

	const handleFocusOff = () => {
		setIsFocused(false);
	};

	const handleHover = () => {
		setIsFocused(true);
		setInvisible(true);
		const	id = notifsIds.find(id => id === pongie.id);

		if (id) {
			const	ids = notifsIds.filter(id => id !== pongie.id);
			setNotifIds(ids);
			
			socket?.emit("clearNotif", {
				which: "redPongies",
				id: pongie.id,
			});
		}
	};

	const handleMouseLeave = () => {
		setIsFocused(false);
	};

	return (
		<div
			onFocus={handleFocusOn}
			onBlur={handleFocusOff}
			onMouseEnter={handleHover}
			onMouseLeave={handleMouseLeave}
		>
			<div className={styles.pongieSearched} >
				<Badge
					overlap="circular"
					sx={badgeStyle}
					variant="dot"
					invisible={invisible}
				>
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
								avatar={pongie.avatar}
								borderSize="3px"
								borderColor={pongie.avatar.borderColor}
								backgroundColor={pongie.avatar.backgroundColor}
								fontSize="1rem"
							/>
						</div>
					</Badge>
					</Tooltip>
				</Badge>

				<div className={styles.login} style={{color: pongie.avatar.borderColor}}>
					<h4>{pongie.login}</h4>
				</div>

			</div>

			{
				isFocused &&
				<PongieFooter pongie={pongie} socket={socket} crossFunction={crossFunction} />
			}
		</div>
	);
}
