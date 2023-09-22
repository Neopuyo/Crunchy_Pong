import { Socket } from "socket.io-client";
import styles from "@/styles/profile/Pongies/SectionPongies.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faFaceLaughBeam, faMessage } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faPlus, faSkull, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Badge, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useRef } from "react";

const badgeStyle = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--primary1)',
	  borderColor: 'var(--tertiary1)',
	  right: "-4px",
	}
}

export default function PongieFooter({pongie, socket, crossFunction}: {
	socket: Socket | undefined;
	pongie: Pongie;
	crossFunction: (pongie: Pongie) => void;
}) {

	const	router = useRouter();
	let		lastToast = useRef<number | undefined>(undefined);

	const	openProfile = () => {
		if (pongie) {
			router.push(`/home/profile/${pongie.id}`);
		}
	}

	const	addFriend = () => {
		const	currentTime = Date.now();

		socket?.emit('addPongie', pongie.id, (payload: {
			success: boolean;
			error: string;
			msg: string;
		}) => {
			if (!payload.success && payload.error === "isBlacklisted") {
				toast.error("You cannot send an invitation to this pongie!");
				return ;
			}

			if (payload.success && payload.msg === "friend") {
				toast.success("Invitation accepted!");
				return ;
			}
				
			if (payload.success && payload.msg === "invited") {
				if (!lastToast.current || (lastToast.current && currentTime - lastToast.current >= 2000)) {
					toast.success("Invitation sent!");
					lastToast.current = currentTime;
				}
				return ;
			}

			toast.error("Something went wrong, please try again");
		});
	}

	const	blackList = () => {
		socket?.emit('blacklist', pongie.id, (payload: {
			success: boolean;
		}) => {
			if (payload && payload.success)
				toast.info("Pongie added to the blacklist!");
			else
				toast.error("Something went wrong, please try again");
		});
	}

	const	openChat = () => {
		socket?.emit('join', {
			id: pongie.id,
			channelName: pongie.login,
			channelType: 'privateMsg',
		}, (payload: {
			success: boolean;
			exists: boolean;
			banned: boolean;
			channel: Channel;
		  }) => {

			if (payload.success)
				router.push(`/home/chat/${payload.channel.id}`)

			else if (payload.banned)
				toast.error("You are not allowed to see this channel!");

			else
				toast.error('Something went wrong, please try again!');
		});
	}

	return (
		<div className={styles.footer}>

			{
				!pongie?.isFriend && !pongie.hasBlacklisted &&
				<Tooltip title="Add Friend" placement="bottom" arrow>
				<div onClick={addFriend}>
					<Badge badgeContent={
						<FontAwesomeIcon
							icon={faPlus}
						/>} sx={badgeStyle}
						style={{cursor: 'pointer'}}
						overlap="circular"
					>
						<FontAwesomeIcon
							icon={faFaceLaughBeam}
							className={styles.icon}
						/>
					</Badge>
				</div>
				</Tooltip>
			}

			{
				pongie?.isFriend && !pongie.hasBlacklisted &&
				<Tooltip title="Friend" placement="bottom" arrow>
					<Badge badgeContent={
						<FontAwesomeIcon
							icon={faCheck}
						/>
					} sx={badgeStyle} overlap="circular" >
						<FontAwesomeIcon
							icon={faFaceLaughBeam}
							className={styles.iconFriend}
							style={{color: "#8bc34a"}}
						/>
					</Badge>
				</Tooltip>
			}

			<Tooltip title="See Profile" placement="bottom" arrow>
				<FontAwesomeIcon
					icon={faAddressCard}
					className={styles.icon}
					onClick={openProfile}
				/>
			</Tooltip>

			{
				!pongie.hasBlacklisted &&
				<Tooltip title="Open Chat" placement="bottom" arrow>
					<FontAwesomeIcon
						icon={faMessage}
						className={styles.icon}
						onClick={openChat}
					/>
				</Tooltip>
			}

			{
				!pongie.hasBlacklisted &&
				<Tooltip title="Blacklist" placement="bottom" arrow>
					<FontAwesomeIcon
						icon={faSkull}
						className={styles.icon}
						onClick={blackList}
					/>
				</Tooltip>
			}

			<Tooltip title="Cancel" placement="bottom" arrow>
				<FontAwesomeIcon
					icon={faXmark}
					className={styles.icon}
					onClick={() => crossFunction(pongie)}
				/>
			</Tooltip>
			
		</div>
	);
}
