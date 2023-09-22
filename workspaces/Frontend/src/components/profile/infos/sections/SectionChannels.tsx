import stylesInfoCard from "@/styles/profile/InfoCard.module.css";
import styles from "@/styles/profile/Pongies/SectionPongies.module.css";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import React from "react";
import AvatarUser from "@/components/avatarUser/AvatarUser";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import SearchBarChannels from "@/components/chatPage/searchBar/SearchBarChannels";
import ChannelList from "./sectionChannels/ChannelList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function SectionChannels({socket, isOwner, profile}: {
	socket: Socket | undefined;
	isOwner: boolean;
	profile: Profile;
}) {

	const	[publicChannels, setPublicChannels] = useState<Channel[]>([]);
	const	[privateChannels, setPrivateChannels] = useState<Channel[]>([]);
	const	[protectedChannels, setProtectedChannels] = useState<Channel[]>([]);
	const	[isInvited, setIsInvited] = useState<Channel[]>([]);
	const	[channelSearched, setChannelSearched] = useState<Channel | undefined>();
	const	[notifIds, setNotifIds] = useState<number[]>([]);
	const	channelSearchedId = useRef<number | undefined>();
	const	router = useRouter();

	useEffect(() => {

		const	getChannels = (payload: Channel[]) => {
			const	isInvited: Channel[] = [];
			const	publicChannels: Channel[] = [];
			const	privateChannels: Channel[] = [];
			const	protectedChannels: Channel[] = [];

			if (payload && payload.length >= 1) {
				for (const	channel of payload) {
					if (channel.isBanned)
						return ;
					if (channel.joined && channel.type === "public")
						publicChannels. push(channel);
					if (channel.joined && channel.type === "private")
						privateChannels. push(channel);
					if (channel.joined && channel.type === "protected")
						protectedChannels. push(channel);
					else if (channel.invited)
						isInvited.push(channel);
				}
			}
			
			setPublicChannels(publicChannels);
			setPrivateChannels(privateChannels);
			setProtectedChannels(protectedChannels);
			setIsInvited(isInvited);
		}

		const	updateChannelSearched = (payload: Channel | { error: string }) => {
			if (payload && 'error' in payload)
				setChannelSearched(undefined);
			else if (payload)
				setChannelSearched(payload);
		}

		const	updateChannels = (payload: {
			why: string;
		}) => {
			if (payload && payload.why === "updateChannels") {

				socket?.emit('getChannelsProfile', profile.id, getChannels);
				
				if (channelSearchedId.current)
					socket?.emit('getChannelProfile', channelSearchedId.current, updateChannelSearched);
			}
		}

		socket?.emit('getChannelsProfile', profile.id, getChannels);

		socket?.on('notif', updateChannels);
		socket?.on('editRelation', updateChannels);

		return () => {
			socket?.off('notif', updateChannels);
			socket?.off('editRelation', updateChannels);
		}

	}, [socket]);

	const	hideChannel = (channel: Channel) => {
		setChannelSearched(undefined);
		channelSearchedId.current = undefined;
	}
	
	const	leaveChannel = (channel: Channel) => {
		socket?.emit('leave', channel.id, (payload: {
			success: boolean;
		}) => {

			if (payload && payload.success)
				toast.success("Channel removed");
		});
	}

	const	openProfile = (id: number) => {
		router.push(`/home/channel/${id}`);
	}

	const	handleClickNew = () => {
		router.push("/home/chat/0");
	}

	const publicChannelsList = publicChannels.map(channel => {
		return (
			<div key={channel.id}>
				<ChannelList
					channel={channel}
					socket={socket}
					crossFunction={leaveChannel}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
				/>
			</div>
		);
	});

	const privateChannelList = privateChannels.map(channel => {
		return (
			<div key={channel.id}>
				<ChannelList
					channel={channel}
					socket={socket}
					crossFunction={leaveChannel}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
				/>
			</div>
		);
	});

	const protectedChannelsList = protectedChannels.map(channel => {
		return (
			<div key={channel.id}>
				<ChannelList
					channel={channel}
					socket={socket}
					crossFunction={leaveChannel}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
				/>
			</div>
		);
	});

	const channelsListNotOwner = publicChannels.map(channel => {
		return (
			<div
				className={styles.pongieSearched + ' ' + styles.otherPongies}
				key={channel.id}
				onClick={() => openProfile(channel.id)}
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

				<div className={styles.login} style={{color: channel.avatar.borderColor}}>
					<h4>{channel.name}</h4>
				</div>

			</div>
		);
	});

	const isInvitedList = isInvited.map(channel => {
		return (
			<div key={channel.id}>
				<ChannelList
					channel={channel}
					socket={socket}
					crossFunction={leaveChannel}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
				/>
			</div>
		);
	});

	if (!socket)
		return <LoadingSuspense />;

	if (isOwner)

		return (
			<div className={stylesInfoCard.sections}>

				<div className={styles.searchBar}>

					<div className={styles.bar}>
						<SearchBarChannels
							socket={socket}
							setChannelSearched={setChannelSearched}
							channelSearchedId={channelSearchedId}
						/>
					</div>

					<FontAwesomeIcon
						icon={faPenToSquare}
						className={styles.menu}
						onClick={handleClickNew}
					/>
				</div>

				{
					channelSearched &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Channel Searched 🔎
						</p>
						<ChannelList
							channel={channelSearched}
							socket={socket}
							crossFunction={hideChannel}
							notifsIds={[]}
							setNotifIds={setNotifIds}
						/>
					</div>
				}

				{
					isInvited.length > 0 &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Invitations received 📩
						</p>
						{isInvitedList}
					</div>
				}

				<div className={styles.part}>
					<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
						Public Channels 😄
					</p>
					{publicChannelsList}
				</div>

				{
					protectedChannels.length > 0 &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Protected Channels 🔒
						</p>
						{protectedChannelsList}
					</div>
				}

				{
					privateChannels.length > 0 &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Private Channels ⛔
						</p>
						{privateChannelList}
					</div>
				}

			</div>
		);
	
	return (
		<div className={stylesInfoCard.sections}>
				<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
					My Channels 😎
				</p>
				{channelsListNotOwner}
		</div>
	);
}
