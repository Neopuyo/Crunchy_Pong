import styles from "@/styles/profile/AvatarCard.module.css";
import { CSSProperties, useEffect, useState } from "react";
import SettingsCard from "./SettingsCard";
import { Color } from "react-color";
import Avatar_Service from "@/services/Avatar.service";
import { Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { CryptoService } from "@/services/Crypto.service";
import fetchClientSide from "@/lib/fetch/fetchClientSide";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";
import AvatarProfile from "./Avatar";

type Props = {
  login: string;
  isOwner: boolean;
  avatar: Avatar;
  socket: Socket | undefined;
  avatars: Avatar[];
};

export default function AvatarCard({
  login,
  isOwner,
  avatar,
  socket,
  avatars,
}: Props) {
  const [displaySettings, setDisplaySettings] = useState<boolean>(false);
  const [topColor, setTopColor] = useState<Color>(avatar.borderColor);
  const [botColor, setBotColor] = useState<Color>(avatar.backgroundColor);
  const [avatarChosen, setAvatarChosen] = useState<Avatar>(avatar);
  const [avatarUser, setAvatarUser] = useState<Avatar>(avatar);
  const [avatarsList, setAvatarsList] = useState<Avatar[]>(avatars);
  const [cloudList, setCloudList] = useState<ImageType[]>([]);
  const [uploadButton, setuploadButton] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<"border" | "background">(
    "border"
  );
  const router = useRouter();
  const avatarService = new Avatar_Service();

  const handleArea = (newArea: "border" | "background" | null) => {
    if (newArea) setSelectedArea(newArea);
  };

  const toogleDisplaySettings = () => {
    if (!isOwner || uploadButton) return;
    if (displaySettings === true) cancelColorChange();
    setDisplaySettings(!displaySettings);
  };

  const saveColorChanges = async (avatarCustomed: Avatar) => {
    if (!isOwner) return;

    try {
      const rep = await avatarService.submitAvatarUser(
        avatarCustomed,
        topColor as string,
        botColor as string
      );

      if (!rep.success) throw new Error(rep.message);

      setAvatarUser({
        ...avatarCustomed,
        backgroundColor: botColor.toString(),
        borderColor: topColor.toString(),
      });

      setDisplaySettings(false);

      socket?.emit("notif", {
        why: "updateProfile",
      });
    } catch (e: any) {
      if (e.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
      toast.error("Something went wrong, please try again!");
    }
  };

  const colorAddedStyle: CSSProperties = {
    background: `linear-gradient(to bottom, ${topColor.toString()} 67.5%, var(--primary1) 33%)`,
  };

  const previewChangeTopColor = (color: string) => {
    setTopColor(color);
  };

  const previewChangeBotColor = (color: string) => {
    setBotColor(color);
  };

  const cancelColorChange = () => {
    setTopColor(avatarUser.borderColor);
    setBotColor(avatarUser.backgroundColor);
    setAvatarChosen(avatarUser);
    setuploadButton(false);
  };

  const changeAvatar = (dir: string) => {
    if (avatarsList.length === 0 || (dir !== "right" && dir !== "left")) return;

    let index = -1;

    for (index; index < avatarsList.length; index++) {
      if (index === -1) continue;
      if (
        avatarChosen.image.length !== 0 &&
        avatarsList[index].image === avatarChosen.image
      )
        break;
      if (avatarChosen.empty && avatarsList[index].empty) break;
      if (
        avatarChosen.image.length === 0 &&
        avatarChosen.text === avatarsList[index].text
      )
        break;
    }

    if (index === avatarsList.length || index === -1) {
      setAvatarChosen(avatars[0]);
      return;
    }

    let newAvatar: Avatar;
    if (dir === "right") {
      if (index !== avatarsList.length - 1) newAvatar = avatarsList[index + 1];
      else newAvatar = avatarsList[0];
    } else {
      if (index !== 0) newAvatar = avatarsList[index - 1];
      else newAvatar = avatarsList[avatarsList.length - 1];
    }

    if (newAvatar) {
      setAvatarChosen(newAvatar);
    }
  };

  useEffect(() => {
    avatarsList.forEach((avatar) => {
      if (avatar.text.length !== 0)
        avatar.text = login.toUpperCase().slice(0, 3);
    });
    if (avatarChosen.text.length !== 0) {
      const newAvatar = { ...avatarChosen };
      newAvatar.text = login.toUpperCase().slice(0, 3);
      setAvatarChosen(newAvatar);
    }
    if (avatarUser.text.length !== 0) {
      const newAvatar = { ...avatarChosen };
      newAvatar.text = login.toUpperCase().slice(0, 3);
      setAvatarUser(newAvatar);
    }
  }, [login]);

  useEffect(() => {
    const getImagesCloud = async () => {
      try {
        const res = await fetchClientSide(
          `http://${process.env.HOST_IP}:4000/api/users/getImages`
        );

        if (!res.ok) throw new Error("fetch failed");

        const data: ImageType[] = await res.json();

        if (data && data.length !== 0) {
          setCloudList((prev) => [...prev, ...data]);
          const newAvatars = [...avatarsList];
          data.forEach((image) => {
            if (!newAvatars.find((avatar) => avatar.image === image.imageUrl))
              newAvatars.push({
                image: image.imageUrl,
                variant: "circular",
                borderColor: avatarUser.borderColor,
                backgroundColor: avatarUser.backgroundColor,
                text: avatarUser.text,
                empty: false,
                isChannel: false,
                decrypt: true,
              });
          });

          setAvatarsList(newAvatars);
        }
      } catch (err: any) {
        if (err.message === "disconnect") {
          await disconnect();
          router.refresh();
          return;
        }
        if (
          process.env &&
          process.env.ENVIRONNEMENT &&
          process.env.ENVIRONNEMENT === "dev"
        )
          console.log(err.message);
      }
    };

    getImagesCloud();
  }, []);

  return (
    <div className={styles.avatarFrame}>
      <div className={styles.avatarCard}>
        <div className={styles.rectangle} style={colorAddedStyle}>
          {displaySettings && (
            <>
              {!uploadButton && (
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className={styles.icon}
                  onClick={() => changeAvatar("left")}
                />
              )}
              <AvatarProfile
                avatar={avatarChosen}
                isOwner={isOwner}
                onClick={toogleDisplaySettings}
                previewBorder={topColor.toString()}
                previewBackground={botColor.toString()}
                displaySettings={displaySettings}
                uploadButton={uploadButton}
                setuploadButton={setuploadButton}
                avatarsList={avatarsList}
                setAvatarsList={setAvatarsList}
                setAvatarChosen={setAvatarChosen}
                cloudList={cloudList}
                setCloudList={setCloudList}
                saveColorChanges={saveColorChanges}
              />
              {!uploadButton && (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={styles.icon}
                  onClick={() => changeAvatar("right")}
                />
              )}
            </>
          )}

          {!displaySettings && (
            <AvatarProfile
              avatar={avatarUser}
              isOwner={isOwner}
              onClick={toogleDisplaySettings}
              previewBorder={topColor.toString()}
              previewBackground={botColor.toString()}
              displaySettings={displaySettings}
              uploadButton={uploadButton}
              setuploadButton={setuploadButton}
              avatarsList={avatarsList}
              setAvatarsList={setAvatarsList}
              setAvatarChosen={setAvatarChosen}
              cloudList={cloudList}
              setCloudList={setCloudList}
              saveColorChanges={saveColorChanges}
            />
          )}
        </div>
      </div>
      <h2 className={styles.login}>{login}</h2>
      {displaySettings && !uploadButton && (
        <SettingsCard
          previewChangeTopColor={previewChangeTopColor}
          previewChangeBotColor={previewChangeBotColor}
          handleArea={handleArea}
          selectedArea={selectedArea}
          toogleDisplaySettings={toogleDisplaySettings}
          saveColorChanges={() => saveColorChanges(avatarChosen)}
        />
      )}
    </div>
  );
}
