import stylesInfoCard from "@/styles/profile/InfoCard.module.css";
import styles from "@/styles/profile/Pongies/SectionPongies.module.css";
import { useEffect, useRef, useState } from "react";
import SearchBarPongies from "@/components/chatPage/searchBar/SearchBarPongies";
import { Socket } from "socket.io-client";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import React from "react";
import PongieList from "./sectionPongies/PongieList";
import AvatarUser from "@/components/avatarUser/AvatarUser";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface StatusData {
    [key: string]: string;
}

export default function SectionPongies({socket, isOwner, profile}: {
	socket: Socket | undefined;
	isOwner: boolean;
	profile: Profile;
}) {

	const	[pongies, setPongies] = useState<Pongie[]>([]);
	const	[isInvited, setIsInvited] = useState<Pongie[]>([]);
	const	[hasInvited, setHasInvited] = useState<Pongie[]>([]);
	const	[hasBlacklisted, setHasBlacklisted] = useState<Pongie[]>([]);
	const	[pongieSearched, setPongieSearched] = useState<Pongie | undefined>();
	const	[notifIds, setNotifIds] = useState<number[]>([]);
	const	[status, setStatus] = useState<Map<string, string>>(new Map());
	const	pongieSearchedId = useRef<number | undefined>();
	const	router = useRouter();

	useEffect(() => {

		const	getPongies = (payload: Pongie[]) => {
			const	isInvited: Pongie[] = [];
			const	hasInvited: Pongie[] = [];
			const	hasBlacklisted: Pongie[] = [];
			const	pongies: Pongie[] = [];

			if (payload && payload.length >= 1) {
				for (const	pongie of payload) {
					if (pongie.hasBlacklisted)
						hasBlacklisted.push(pongie);
					else if (pongie.isFriend)
						pongies.push(pongie);
					else if (pongie.hasInvited)
						hasInvited.push(pongie);
					else if (pongie.isInvited)
						isInvited.push(pongie);
				}
			}
			
			setPongies(pongies);
			setIsInvited(isInvited);
			setHasInvited(hasInvited);
			setHasBlacklisted(hasBlacklisted);
		}

		const	updatePongieSearched = (payload: Pongie | { error: string }) => {
			if (payload && 'error' in payload)
				setPongieSearched(undefined);
			else if (payload)
				setPongieSearched(payload);
		}

		const	updatePongies = (payload: {
			why: string;
		}) => {
			if (payload && payload.why === "updatePongies") {
				socket?.emit('getNotif', (payload: Notif) => {
					if (payload && payload.redPongies) {
						setNotifIds(payload.redPongies);
					}
				});

				socket?.emit('getPongies', profile.id, getPongies);
				if (pongieSearchedId.current)
					socket?.emit('getPongie', pongieSearchedId.current, updatePongieSearched);
			}
		}

		const	updateStatus = (payload: StatusData) => {
			setStatus(prevStatus => {
			  const newStatus = new Map(prevStatus);
			  Object.entries(payload).forEach(([key, value]) => {
				newStatus.set(key, value);
			  });
			  return newStatus;
			});
		  }

		socket?.emit('getPongies', profile.id, getPongies);

		socket?.emit('getNotif', (payload: Notif) => {
			if (payload && payload.redPongies.length > 0) {
			  setNotifIds(payload.redPongies);
			}
		});

		socket?.emit('getStatus', (payload: StatusData) => {
			if (payload) {
				const statusMap = new Map(Object.entries(payload));
				setStatus(statusMap);
			}
		});

		socket?.on('notif', updatePongies);
		socket?.on('updateStatus', updateStatus);

		return () => {
			socket?.off('notif', updatePongies);
			socket?.off('updateStatus', updateStatus);
		}

	}, [socket]);

	const	hidePongie = (pongie: Pongie) => {
		setPongieSearched(undefined);
		pongieSearchedId.current = undefined;
	}

	const	cancelInvitation = (pongie: Pongie) => {
		socket?.emit('cancelInvitation', pongie.id, (payload: {
			success: boolean;
		}) => {
			if (payload && payload.success)
				toast('Invitation cancelled!');
			else
				toast.error("Something went wrong, please try again");
		});
	}

	const	refuseInvitation = (pongie: Pongie) => {
		socket?.emit('cancelInvitation', pongie.id, (payload: {
			success: boolean;
		}) => {
			if (payload && payload.success)
				toast('Invitation refused!');
			else
				toast.error("Something went wrong, please try again");
		});
	}

	const	cancelBlacklist = (pongie: Pongie) => {
		socket?.emit('cancelBlacklist', pongie.id, (payload: {
			success: boolean;
		}) => {
			if (payload && payload.success)
				toast('Blacklist updated!');
			else
				toast.error("Something went wrong, please try again");
		});
	}
	
	const	deletePongie = (pongie: Pongie) => {
		socket?.emit('deletePongie', pongie.id, (payload: {
			success: boolean;
		}) => {
			if (!payload.success) {
				toast.error("Something went wrong, please try again");
				return ;
			}

			if (payload.success)
				toast.success("Friend removed");
		});
	}

	const	openProfile = (id: number) => {
		router.push(`/home/profile/${id}`);
	}

	const pongiesList = pongies.map(pongie => {
		return (
			<div key={pongie.id}>
				<PongieList
					pongie={pongie}
					socket={socket}
					crossFunction={deletePongie}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
					status={status}
				/>
			</div>
		);
	});

	const pongiesListNotOwner = pongies.map(pongie => {
		return (
			<div
				className={styles.pongieSearched + ' ' + styles.otherPongies}
				key={pongie.id}
				onClick={() => openProfile(pongie.id)}
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

				<div className={styles.login} style={{color: pongie.avatar.borderColor}}>
					<h4>{pongie.login}</h4>
				</div>

			</div>
		);
	});

	const isInvitedList = isInvited.map(pongie => {
		return (
			<div key={pongie.id}>
				<PongieList
					pongie={pongie}
					socket={socket}
					crossFunction={refuseInvitation}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
					status={status}
				/>
			</div>
		);
	});

	const hasInvitedList = hasInvited.map(pongie => {
		return (
			<div key={pongie.id}>
				<PongieList
					pongie={pongie}
					socket={socket}
					crossFunction={cancelInvitation}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
					status={status}
				/>
			</div>
		);
	});

	const hasBlacklistedList = hasBlacklisted.map(pongie => {
		return (
			<div key={pongie.id}>
				<PongieList
					pongie={pongie}
					socket={socket}
					crossFunction={cancelBlacklist}
					notifsIds={notifIds}
					setNotifIds={setNotifIds}
					status={status}
				/>
			</div>
		);
	});

	if (!socket)
		return <LoadingSuspense />;

	if (isOwner)
		return (
			<div className={stylesInfoCard.sections}>
				<SearchBarPongies
					socket={socket}
					setPongieSearched={setPongieSearched}
					pongieSearchedId={pongieSearchedId}
					placeholder="Find pongies..."
				/>

				{
					pongieSearched &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Pongie Searched 🔎
						</p>
						<PongieList
							pongie={pongieSearched}
							socket={socket}
							crossFunction={hidePongie}
							notifsIds={[]}
							setNotifIds={setNotifIds}
							status={status}
						/>
					</div>
				}

				<div className={styles.part}>
					<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
						All my Pongies 😎
					</p>
					{pongiesList}
				</div>

				{
					isInvited.length > 0 &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Invitations received 📩
						</p>
						{isInvitedList}
					</div>
				}

				{
					hasInvited.length > 0 &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Invitations sent 📨
						</p>
						{hasInvitedList}
					</div>
				}

				{
					hasBlacklisted.length > 0 &&
					<div className={styles.part}>
						<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
							Blacklisted Pongies ⛔
						</p>
						{hasBlacklistedList}
					</div>
				}

			</div>
		);
	
	return (
		<div className={stylesInfoCard.sections}>
				<p className={stylesInfoCard.tinyTitle} style={{fontSize: "0.9rem"}}>
					All my Pongies 😎
				</p>
				{pongiesListNotOwner}
		</div>
	);
}
