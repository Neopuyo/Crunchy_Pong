import { ReactNode, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import styles from "@/styles/chatPage/displayInfos/DisplayInfos.module.css";
import React from "react";
import AvatarUser from "@/components/avatarUser/AvatarUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import SearchBar from "../searchBar/SearchBar";

export default function DisplayInfos({
  icon,
  socket,
  openDisplay,
  confirm,
  cancel,
  confirmDelete,
  littleScreen,
}: {
  icon: ReactNode;
  socket: Socket | undefined;
  openDisplay: (display: Display) => void;
  confirm: Pongie | Channel | null;
  cancel: (event: React.MouseEvent) => void;
  confirmDelete: (data: Pongie | Channel, event: React.MouseEvent) => void;
  littleScreen: boolean,
}) {
  const [channels, setChannels] = useState<Channel []>([]);

  const	deleteItem = (channel: Channel, event: React.MouseEvent) => {
	event.stopPropagation();

	socket?.emit("leave", channel.id);

	const updatedChannels = channels.filter((item) => item !== channel);
	setChannels(updatedChannels);
  }

  const channelsList = channels.map((channel) => {
		return (
			<React.Fragment key={channel.id}>
				<div
					className={styles.list}
					onClick={() => openDisplay(channel)}
				>
					<div className={styles.flex}>
						<div className={styles.avatar}>
							<AvatarUser
								avatar={channel.avatar}
								borderSize="2px"
								borderColor={channel.avatar.borderColor}
								backgroundColor={channel.avatar.backgroundColor}
								fontSize="1rem"
							/>
						</div>
						
						<div className={styles.name}>
							{channel.name}
						</div>

						<div 
							className={styles.delete}
							onClick={(event) => confirmDelete(channel, event)}
						>
							<FontAwesomeIcon
								icon={faTrashCan}
							/>
						</div>
					</div>

					{
						confirm === channel && 
						<div className={styles.confirm}>
							<p>Are you sure?</p>
							<button onClick={(event) => deleteItem(channel, event)}>Yes</button>
							<button onClick={(event) => cancel(event)}>No</button>
						</div>
  					}

				</div>
			</React.Fragment>
		);
	});
	
	useEffect(() => {
		socket?.emit("getChannels", (channels: Channel []) => {
			channels = channels.filter(channel => channel.type !== 'privateMsg');
			setChannels(channels);
		});
	}, [socket]);

	return (
		<>
			<div className={styles.header}>
				{icon}
				<h3>My Channels!</h3>
				<div></div>
			</div>
			<div className={styles.main}>
				{
					littleScreen && 
					<div className={styles.search}>
						<SearchBar
							socket={socket}
							openDisplay={openDisplay}
						/>
					</div>
				}
				{channelsList}
			</div>
		</>
	);
}
