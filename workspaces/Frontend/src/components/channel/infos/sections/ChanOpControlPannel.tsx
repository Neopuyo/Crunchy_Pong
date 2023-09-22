import { ChannelRoles } from "@/lib/enums/ChannelRoles.enum";
import Channel_Service from "@/services/Channel.service";
import styles from "@/styles/profile/InfoCard.module.css";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCertificate,
  faSkull,
  faHand,
  faHandPeace,
  faBahai,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction, useState } from "react";
import { Socket } from "socket.io-client";
import ConfirmationPannel from "./ConfirmationPannel";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  channelId: number;
  relation: UserRelation;
  myRelation: UserRelation;
  role: ChannelRoles;
  lists: ChannelLists;
  socket: Socket | undefined;
};

type ButtonData = {
  id: number;
  name: string;
  icon: IconProp;
  onClick: () => void;
  colorDep: boolean;
};

type UpdateOptions = {
  isBoss?: boolean;
  isChanOp?: boolean;
  joined?: boolean;
  isBanned?: boolean;
  invited?: boolean;
  muted?: boolean;
  onSuccess: () => void;
};

export default function ChanOpControlPannel({
  channelId,
  relation,
  myRelation,
  role,
  lists,
  socket,
}: Props) {
  const channelService = new Channel_Service();
  const router = useRouter();

  const [waitingConfirmation, setWaitingConfirmation] =
    useState<boolean>(false);
  const [confirmationList, setConfirmationList] =
    useState<ConfirmationList>("nothing");

  const jumpList = (
    setJumpFrom: Dispatch<SetStateAction<UserRelation[]>>,
    setjumpInto: Dispatch<SetStateAction<UserRelation[]>>,
    relation: UserRelation
  ) => {
    setJumpFrom((prev: UserRelation[]) =>
      prev.filter((user: UserRelation) => user.userId !== relation.userId)
    );
    setjumpInto((prev: UserRelation[]) => [...prev, relation]);
  };

  const sendUpdates = async (options: UpdateOptions) => {
    const {
      isBoss = undefined,
      isChanOp = undefined,
      joined = undefined,
      isBanned = undefined,
      muted = undefined,
      invited = undefined,
    } = options;
    const rep = await channelService.editRelation(channelId, relation.userId, {
      isBoss,
      isChanOp,
      joined,
      isBanned,
      invited,
      muted
    });
    if (rep.success) {
      options.onSuccess();

    socket?.emit("editRelation", {
      channelId: channelId,
      newRelation: {
        isBoss : options.isBoss,
        isChanOp : options.isChanOp,
        joined : options.joined,
        isBanned : options.isBanned,
        invited : options.invited,
        muted : options.muted,
      },
      userId: relation.userId,
    });
	  
    } else {
      if (rep.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
      lists.setNotif("Error : " + rep.message + " ...try later please");
    }
  };

  const handleChanOp = async () => {
    if (relation.isChanOp) {
      sendUpdates({
        isChanOp: false,
        onSuccess: () => {
          relation.isChanOp = false;
          jumpList(lists.setOperators, lists.setPongers, relation);
        },
      });
    } else {
      sendUpdates({
        isChanOp: true,
        onSuccess: () => {
          relation.isChanOp = true;
          jumpList(lists.setPongers, lists.setOperators, relation);
        },
      });
    }
  };

  const handleKick = () => {
    if (relation.invited) {
      sendUpdates({
        invited: false,
        onSuccess: () => {
          relation.invited = false;
          jumpList(lists.setInvited, lists.setLeavers, relation);
        },
      });
    }
    if (relation.joined) {
      sendUpdates({
        joined: false,
        onSuccess: () => {
          relation.joined = false;
          jumpList(lists.setPongers, lists.setLeavers, relation);
        },
      });
    }
  };

  const handleBan = () => {
    // [1] remove ban
    if (relation.isBanned) {
      // invited or joined
      if (relation.joined) {
        sendUpdates({
          isBanned: false,
          onSuccess: () => {
            relation.isBanned = false;
            jumpList(lists.setBanned, lists.setPongers, relation);
          },
        });
      } else {
        sendUpdates({
          isBanned: false,
          invited: true,
          onSuccess: () => {
            relation.isBanned = false;
            relation.invited = true;
            jumpList(lists.setBanned, lists.setInvited, relation);
          },
        });
      }
      // [2] give ban
    } else if (relation.invited) {
      sendUpdates({
        isBanned: true,
        onSuccess: () => {
          relation.isBanned = true;
          jumpList(lists.setInvited, lists.setBanned, relation);
        },
      });
    } else if (relation.joined) {
      sendUpdates({
        isBanned: true,
        onSuccess: () => {
          relation.isBanned = true;
          jumpList(lists.setPongers, lists.setBanned, relation);
        },
      });
    } else if (!relation.joined) {
      sendUpdates({
        isBanned: true,
        onSuccess: () => {
          relation.isBanned = true;
          jumpList(lists.setLeavers, lists.setBanned, relation);
        },
      });
    }
  };

  const handleInvite = () => {
    if (!relation.invited) {
      sendUpdates({
        invited: true,
        onSuccess: () => {
          relation.invited = true;
          jumpList(lists.setLeavers, lists.setInvited, relation);
        },
      });
    }
  };

  const handleBoss = () => {
	if (relation.isBoss) {
		sendUpdates({
		  isBoss: false,
		  onSuccess: () => {
			relation.isBoss = false;
			jumpList(lists.setBoss, lists.setPongers, relation);
		  },
		});
	  } else {
		sendUpdates({
		  isBoss: true,
		  onSuccess: () => {
			relation.isBoss = true;
			jumpList(lists.setOperators, lists.setBoss, relation);
		  },
		});
	  }
  }

  const handleMute = () => {
	if (relation.muted) {
		sendUpdates({
		  muted: false,
		  onSuccess: () => {
			relation.muted = false;
		  },
		});
	  } else {
		sendUpdates({
			muted: true,
			onSuccess: () => {
			  relation.muted = true;
			},
		  });
	}
  }

  const handleValidate = () => {
    if (confirmationList === "boss") handleBoss();
	  else if (confirmationList === "chanOp") handleChanOp();
    else if (confirmationList === "kick") handleKick();
    else if (confirmationList === "ban") handleBan();
    else if (confirmationList === "invite") handleInvite();
	  else if (confirmationList === "mute") handleMute();
    handleCancel();
  };

  const handleCancel = () => {
    setConfirmationList("nothing");
    setWaitingConfirmation(false);
  };

  const updateConfirmation = (status:ConfirmationList) => {
    setConfirmationList(status);
    setWaitingConfirmation(true);
  }

  const buttonData: ButtonData[] = (() => {
    switch (role) {

		case ChannelRoles.boss:
			if (relation.userId !== myRelation.userId && myRelation.isBoss) {
				return [
					{
						id: 0,
						name: "boss",
						icon: faBahai,
						onClick: () => updateConfirmation("boss"),
						colorDep: relation.isBoss,
					}
				];
			  } else return [];


      case ChannelRoles.operator:
        if (relation.userId !== myRelation.userId && myRelation.isBoss) {
          return [
            {
				id: 0,
				name: "boss",
				icon: faBahai,
				onClick: () => updateConfirmation("boss"),
				colorDep: relation.isBoss,
			},
			{
				id: 1,
				name: "mute",
				icon: faVolumeHigh,
				onClick: () => updateConfirmation("mute"),
				colorDep: !relation.muted,
			  },
			{
              id: 2,
              name: "chanOp",
              icon: faCertificate,
              onClick: () => updateConfirmation("chanOp"),
              colorDep: relation.isChanOp,
            },
          ];
        } else if (relation.userId !== myRelation.userId && !myRelation.isBoss) {
			return [
				{
					id: 0,
					name: "mute",
					icon: faVolumeHigh,
					onClick: () => updateConfirmation("mute"),
					colorDep: !relation.muted,
				  },
				{
				  id: 1,
				  name: "chanOp",
				  icon: faCertificate,
				  onClick: () => updateConfirmation("chanOp"),
				  colorDep: relation.isChanOp,
				},
			  ];
		}
		else return [];

      case ChannelRoles.ponger:
        return [
          {
            id: 0,
            name: "chanOp",
            icon: faCertificate,
            onClick: () => updateConfirmation("chanOp"),
            colorDep: relation.isChanOp,
          },
		  {
			id: 1,
			name: "mute",
			icon: faVolumeHigh,
			onClick: () => updateConfirmation("mute"),
			colorDep: !relation.muted,
		  },
          {
            id: 2,
            name: "kick",
            icon: faHand,
            onClick: () => updateConfirmation("kick"),
            colorDep: true,
          },
          {
            id: 3,
            name: "ban",
            icon: faSkull,
            onClick: () => updateConfirmation("ban"),
            colorDep: !relation.isBanned,
          },
        ];

      case ChannelRoles.invited:
        return [
          {
            id: 0,
            name: "kick",
            icon: faHand,
            onClick: () => updateConfirmation("kick"),
            colorDep: true,
          },
        ];

      case ChannelRoles.banned:
        return [
          {
            id: 0,
            name: "ban",
            icon: faSkull,
            onClick: () => updateConfirmation("ban"),
            colorDep: !relation.isBanned,
          },
        ];

      case ChannelRoles.leaver:
        return [
          {
            id: 0,
            name: "invite",
            icon: faHandPeace,
            onClick: () => updateConfirmation("invite"),
            colorDep: relation.joined,
          },
          {
            id: 1,
            name: "ban",
            icon: faSkull,
            onClick: () => updateConfirmation("ban"),
            colorDep: !relation.isBanned,
          },
        ];

      default:
        return [];
    }
  })();

  return (
    <div className={styles.controlPannel}>
      {waitingConfirmation && (
        <ConfirmationPannel
          handleValidate={handleValidate}
          handleCancel={handleCancel}
          confirmationList={confirmationList}
          relation={relation}
        />
      )}

      {!waitingConfirmation &&
        buttonData.map((button) => (
          <FontAwesomeIcon
            className={styles.command}
            key={button.id}
            onClick={button.onClick}
            icon={button.icon}
            style={{
              color: button.colorDep ? "var(--notif)" : "var(--accent1)",
            }}
          />
        ))}
    </div>
  );
}
