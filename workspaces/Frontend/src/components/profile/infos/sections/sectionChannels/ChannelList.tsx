import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import styles from "@/styles/profile/Pongies/SectionPongies.module.css";
import AvatarUser from "@/components/avatarUser/AvatarUser";
import { Badge } from "@mui/material";
import ChannelFooter from "../footerOptions/ChannelFooter";

const badgeStyle = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--notif)',
    border: '2px solid var(--notif)',
    width: "12px",
    height: "12px",
    borderRadius: "100%",
	}
}

export default function ChannelList({channel, socket, crossFunction, notifsIds, setNotifIds}: {
	channel: Channel;
	socket: Socket | undefined;
	crossFunction: (channel: Channel) => void;
	notifsIds: number[];
	setNotifIds: React.Dispatch<React.SetStateAction<number[]>>;
}) {
	const	[isFocused, setIsFocused] = useState(false);
	const	[invisible, setInvisible] = useState(true);

	useEffect(() => {
		const	match = notifsIds.find(id => id === channel.id);

		if (match && invisible)
			setInvisible(false);
		if (!match && !invisible)
			setInvisible(true);
	}, [notifsIds]);

	const handleFocusOn = () => {
		setIsFocused(true);
		setInvisible(true);
		const	ids = notifsIds.filter(id => id !== channel.id);
		setNotifIds(ids);
		
		socket?.emit("clearNotif", {
			which: "redChannels",
			id: channel.id,
		});
	};

	const handleFocusOff = () => {
		setIsFocused(false);
	};

	const handleHover = () => {
		setIsFocused(true);
		setInvisible(true);
		const	ids = notifsIds.filter(id => id !== channel.id);
		setNotifIds(ids);
		
		socket?.emit("clearNotif", {
			which: "redChannels",
			id: channel.id,
		});
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
					<div className={styles.avatar}>
						<AvatarUser
							avatar={channel.avatar}
							borderSize="3px"
							borderColor={channel.avatar.borderColor}
							backgroundColor={channel.avatar.backgroundColor}
							fontSize="1rem"
						/>
					</div>
				</Badge>

				<div className={styles.login} style={{color: channel.avatar.borderColor}}>
					<h4>{channel.name}</h4>
				</div>

			</div>

			{
				isFocused &&
				<ChannelFooter channel={channel} socket={socket} crossFunction={crossFunction} />
			}
		</div>
	);
}
