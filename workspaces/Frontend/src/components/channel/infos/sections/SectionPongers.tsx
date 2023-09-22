import styles from "@/styles/profile/InfoCard.module.css";
import { ChannelRoles } from "@/lib/enums/ChannelRoles.enum";
import RolesList from "./RolesList";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import {
	faCertificate,
	faSkull,
	faFaceSmile,
	faHandPeace,
	faBahai,
	IconDefinition,
	faPersonThroughWindow,
  } from "@fortawesome/free-solid-svg-icons";
import InviteInChannel from "./inviteInChanel/InviteInChannel";

type Props = {
  relation: ChannelUsersRelation;
  myRelation: UserRelation;
  socket: Socket | undefined;
};

interface StatusData {
  [key: string]: string;
}

export default function SectionPongers({
  relation,
  myRelation,
  socket,
}: Props) {

const	[boss, setBoss] = useState<UserRelation[]>([]);
const	[operators, setOperators] = useState<UserRelation[]>([]);
const	[pongers, setPongers] = useState<UserRelation[]>([]);
const	[invited, setInvited] = useState<UserRelation[]>([]);
const	[banned, setBanned] = useState<UserRelation[]>([]);
const	[leavers, setLeavers] = useState<UserRelation[]>([]);
const	[status, setStatus] = useState<Map<string, string>>(new Map());
const [notif, setNotif] = useState<string>("");

useEffect(() => {
  const filteredBoss = relation.usersRelation.filter((relation) => (relation.isBoss && relation.joined));
  const filteredOperators = relation.usersRelation.filter((relation) => (relation.isChanOp && !relation.isBoss && !relation.isBanned && relation.joined));
  const filteredPongers = relation.usersRelation.filter((relation) => (relation.joined  && !relation.isBoss && !relation.isChanOp && !relation.isBanned));
  const filteredInvited = relation.usersRelation.filter((relation) => (!relation.joined && !relation.isChanOp && !relation.isBanned && relation.invited));
  const filteredBanned = relation.usersRelation.filter((relation) => (relation.isBanned));
  const filteredLeavers = relation.usersRelation.filter((relation) => (!relation.joined && !relation.isBanned && !relation.invited));

  setBoss(filteredBoss);
  setOperators(filteredOperators);
  setPongers(filteredPongers);
  setInvited(filteredInvited);
  setBanned(filteredBanned);
  setLeavers(filteredLeavers);

}, [relation]);

  useEffect(() => {
    const	updateStatus = (payload: StatusData) => {
      setStatus(prevStatus => {
        const newStatus = new Map(prevStatus);
        Object.entries(payload).forEach(([key, value]) => {
          newStatus.set(key, value);
        });
        return newStatus;
      });
    }
      
    socket?.emit('getStatus', (payload: StatusData) => {
      if (payload) {
        const statusMap = new Map(Object.entries(payload));
        setStatus(statusMap);
      }
    });

    socket?.on('updateStatus', updateStatus);

    return () => {
      socket?.off('updateStatus', updateStatus);
    }

  }, [socket]);

	const lists:ChannelLists = {
		setBoss: setBoss,
		setOperators: setOperators,
		setPongers: setPongers,
		setInvited: setInvited,
		setBanned: setBanned,
		setLeavers: setLeavers,
		setNotif: setNotif,
	}

  const renderRowList = (role:ChannelRoles, icon:IconDefinition, relations: UserRelation[]):JSX.Element => {
    if ((relations.length === 0)) {
      return <></>
    } else {
      return (
        <RolesList
          channelId={relation.channel.id}
          relations={relations}
          myRelation={myRelation}
          role={role}
          icon={icon}
          lists={lists}
          socket={socket}
          status={status}
        />
      );
    }
  };

  const putSpliter = ():JSX.Element  => {
	if (myRelation.isChanOp || myRelation.isBoss) {
		if (invited.length === 0 && banned.length === 0 && leavers.length === 0)
			return <></>;
	} else {
		if (invited.length === 0 && banned.length === 0)
		return <></>;
	}
	return <div className={styles.spliter}></div>
  }

  return <div className={styles.sections}>
    {
      (myRelation.isBoss || myRelation.isChanOp) &&
      <InviteInChannel relation={relation} myRelation={myRelation} socket={socket}/>
    }
    <p className={styles.notif}>{notif}</p>
    {renderRowList(ChannelRoles.boss, faBahai, boss)}
      {renderRowList(ChannelRoles.operator, faCertificate, operators)}
      {renderRowList(ChannelRoles.ponger, faFaceSmile, pongers)}
    {putSpliter()}
      {renderRowList(ChannelRoles.invited, faHandPeace, invited)}
      {(myRelation.isChanOp || myRelation.isBoss) && renderRowList(ChannelRoles.leaver, faPersonThroughWindow, leavers)}
      {renderRowList(ChannelRoles.banned, faSkull, banned)}
  </div>;
}
