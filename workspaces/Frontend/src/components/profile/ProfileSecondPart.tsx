import styles from "@/styles/profile/Profile.module.css";
import InfoCard from "./infos/InfoCard";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import PongieFooter from "./infos/sections/footerOptions/PongieFooter";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  profile: Profile;
  isOwner: boolean;
  setLogin: Dispatch<SetStateAction<string>>;
  socket: Socket | undefined;
};

export default function ProfileSecondPart({ profile, isOwner, setLogin, socket }: Props) {

  const [pongie, setPongie] = useState<Pongie | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {

    const updatePongie = (payload: {
      why: string;
    }) => {
      if (payload && payload.why && payload.why === "updatePongies") {
        socket?.emit('getPongie', profile.id, (payload: Pongie) => {
          setPongie(payload);
        });
      }
    }

    socket?.emit('getPongie', profile.id, (payload: Pongie) => {
      setPongie(payload);
    });

    socket?.on('notif', updatePongie);

		return () => {
			socket?.off('notif', updatePongie);
		}
  }, [socket]);

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
  const crossFunction = (pongie: Pongie) => {
    if (pongie.hasBlacklisted)
      cancelBlacklist(pongie);
    else if (pongie.isFriend)
      deletePongie(pongie);
    else if (pongie.isInvited)
      refuseInvitation(pongie);
    else if (pongie.hasInvited)
      cancelInvitation(pongie);
    else
      router.back();
  }

  return (
    <div className={styles.both + " " + styles.second}>
      <InfoCard profile={profile} isOwner={isOwner} setLogin={setLogin} socket={socket}/>

      {
        !isOwner && pongie &&
        <PongieFooter
          socket={socket}
          pongie={pongie}
          crossFunction={crossFunction}
        />
      }

    </div>
  );
}
