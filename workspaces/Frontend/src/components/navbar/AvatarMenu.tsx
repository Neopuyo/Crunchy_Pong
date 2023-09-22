import { useState, useRef, useEffect } from "react";
import styles from "@/styles/navbar/AvatarMenu.module.css";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AvatarUser from "../avatarUser/AvatarUser";
import { Socket } from "socket.io-client";
import disconnect from "@/lib/disconnect/disconnect";
import ChatService from "@/services/Chat.service";
import { Badge } from "@mui/material";

type Props = {
  avatar: Avatar;
  profile: Profile;
  socket: Socket | undefined;
};

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

const badgeStyleProfile = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--notif)',
    border: '2px solid var(--notif)',
    width: "6px",
    height: "8px",
    top: "4px",
    right: "-2px",
    borderRadius: "100%",
	}
}

export default function AvatarMenu({ avatar, profile, socket }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [avatarUpdated, setAvatarUpdated] = useState<Avatar>(avatar);
  const [login, setLogin] = useState<string>(profile.login);
  const [invisible, setInvisible] = useState<boolean>(true);
  const [notif, setNotif] = useState<boolean>(false);
  const pathName = usePathname();

  if (pathName.startsWith("/home/profile") && !invisible)
    setInvisible(true);

  if (!pathName.startsWith("/home/profile") && invisible && notif)
    setInvisible(false);

  const signoff = async () => {
    try {
      const chatService = new ChatService();
      chatService.disconnectClient = true;
      socket?.emit('disconnectClient');
      await disconnect(profile.id.toString());
      router.push('/welcome');
    } catch (error) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error);
    }
  };

  useEffect(() => {
    setAvatarUpdated(avatar);
    setLogin(profile.login);
  }, [avatar]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const updateNotif = () => {
      socket?.emit('getNotif', (payload: Notif) => {
        if (payload && (payload.redAchievements || payload.redPongies.length > 0)) {
          setInvisible(false);
          setNotif(true);
        }
        else {
          setInvisible(true);
          setNotif(false);
        }
      });
    }
    
    const updateProfile = (payload: {
      why: string;
    }) => {
      if (payload && payload.why && payload.why === "updateProfile")
        socket?.emit(
          "getLoginWithAvatar",
          (payload: { login: string; avatar: Avatar }) => {
            setAvatarUpdated(payload.avatar);
            setLogin(payload.login);
          }
      );
      else if (payload && payload.why && (payload.why === "updatePongies" || payload.why === "updateAchievements"))
        updateNotif();
    };

    updateNotif();

    socket?.on("notif", updateProfile);
    socket?.on("achievement", updateNotif);

    return () => {
      socket?.off("notif", updateProfile);
      socket?.off("notif", updateNotif);
    };
  }, [socket]);

  return (
    <Badge
      overlap="circular"
      sx={badgeStyle}
      variant="dot"
      invisible={invisible}
    >
      <div className={styles.menu} onClick={() => setMenuOpen(!menuOpen)}>
        <div className={styles.avatar}>
          <AvatarUser
            avatar={avatarUpdated}
            borderSize={"3px"}
            backgroundColor={avatarUpdated.backgroundColor}
            borderColor={avatarUpdated.borderColor}
            fontSize="1rem"
          />
        </div>
        {menuOpen && profile.id > 0 && (
          <div className={styles.dropdown} ref={menuRef}>
            <ul className={styles.list}>
              <Link href={`/home/profile/${profile.id}`}>
                <li className={styles.profile}>
                  <Badge
                    overlap="rectangular"
                    sx={badgeStyleProfile}
                    variant="dot"
                    invisible={invisible}
                  >
                    {login}
                  </Badge>
                </li>
              </Link>
              <li onClick={signoff} className={styles.logOut}>
                Log Out
              </li>
            </ul>
          </div>
        )}
      </div>
    </Badge>
  );
}
