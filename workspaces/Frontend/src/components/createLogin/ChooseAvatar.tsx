"use client";

import Avatar from "@mui/material/Avatar";
import styles from "@/styles/createLogin/ChooseAvatar.module.css";
import { useEffect, useState } from "react";
import ChooseColor from "./ChooseColor";
import { PongColors } from "@/lib/enums/PongColors.enum";
import UploadButton from "../uploadImage/UploadButton";
import AvatarCloud from "./AvatarCloud";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";
import fetchClientSide from "@/lib/fetch/fetchClientSide";

export default function ChooseAvatar({
  selectBorder,
  selectBackground,
  selectAvatar,
  text,
  avatars,
  avatarCrypted,
  fontSize,
  textButton,
  textButtonInitial,
}: {
  selectBorder: (color: string) => void;
  selectBackground: (color: string) => void;
  selectAvatar: (avatar: Avatar) => void;
  text: string;
  avatars: string[];
  avatarCrypted: string | undefined;
  fontSize: string;
  textButton: string;
  textButtonInitial: string;
}) {
  const [colorBorder, setColorBorder] = useState<string>(PongColors.appleGreen);
  const [backgroundColor, setBackgroundColor] = useState<string>(PongColors.appleGreen);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("empty");
  const [avatarsAdded, setAvatarsAdded] = useState<ImageType[]>([]);
  const router = useRouter();

  const handleBorder = (color: string) => {
    setColorBorder(color);
    selectBorder(color);
  };

  const handleBackground = (color: string) => {
    setBackgroundColor(color);
    selectBackground(color);
  };

  const handleSelectAvatar = (key: string, avatar: Avatar) => {
    if (textButton === textButtonInitial) {
      setSelectedAvatar(key);
      selectAvatar(avatar);
    }
  };

  useEffect(() => {
    const getImagesCloud = async () => {
      try {

        const res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/users/getImages`);

        if (!res.ok)
          throw new Error('fetch failed');

        const data: ImageType[] = await res.json();

        setAvatarsAdded(prev => [...prev, ...data]);
      }
      catch (err: any) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log(err.message);
        if (err.message === "disconnect")
          await disconnect();
          router.refresh();
          return ;
      }
    }

    getImagesCloud();

  }, []);

  return (
    <div>
      <div className={styles.main}>

        <Avatar
          className={`${styles.avatar} ${
            "empty" === selectedAvatar ? styles.selected : ""
          }`}
          variant="circular"
          onClick={() =>
            handleSelectAvatar("empty", {
              image: "",
              variant: "circular",
              borderColor: colorBorder,
              backgroundColor: backgroundColor,
              text: text,
              empty: true,
              isChannel: false,
              decrypt: false,
            })
          }
          sx={{
            width: 'clamp(60px, 8vh, 150px)',
            height: 'clamp(60px, 8vh, 150px)',
            border: `4px solid ${colorBorder}`,
            backgroundColor: `${backgroundColor}`,
          }}
        />

        <Avatar
          className={`${styles.avatar} ${
            text === selectedAvatar ? styles.selected : ""
          }`}
          key={text}
          variant="circular"
          imgProps={{
            referrerPolicy: "no-referrer",
          }}
          onClick={() =>
            handleSelectAvatar(text, {
              image: "",
              variant: "circular",
              borderColor: colorBorder,
              backgroundColor: backgroundColor,
              text: text.toUpperCase().slice(0, 3),
              empty: false,
              isChannel: false,
              decrypt: false,
            })
          }
          sx={{
            width: 'clamp(60px, 8vh, 150px)',
            height: 'clamp(60px, 8vh, 150px)',
            border: `4px solid ${colorBorder}`,
            backgroundColor: `${backgroundColor}`,
            fontSize: fontSize,
          }}
        >
          {text.toUpperCase().slice(0, 3)}
        </Avatar>

        {
          avatarCrypted &&
          <Avatar
              className={`${styles.avatar} ${
                avatarCrypted === selectedAvatar ? styles.selected : ""
              }`}
              key={avatarCrypted}
              src={avatarCrypted}
              alt={text}
              variant="circular"
              onClick={() =>
                handleSelectAvatar(avatarCrypted, {
                  image: avatarCrypted,
                  variant: "circular",
                  borderColor: colorBorder,
                  backgroundColor: backgroundColor,
                  text: text,
                  empty: false,
                  isChannel: false,
                  decrypt: true,
                })
              }
              sx={{
                width: 'clamp(60px, 8vh, 150px)',
                height: 'clamp(60px, 8vh, 150px)',
                border: `4px solid ${colorBorder}`,
                backgroundColor: `${backgroundColor}`,
              }}
            />
        }

        {avatars.map((avatar) => {
          return (
            <Avatar
              className={`${styles.avatar} ${
                avatar === selectedAvatar ? styles.selected : ""
              }`}
              key={avatar}
              src={avatar}
              alt={text}
              variant="circular"
              onClick={() =>
                handleSelectAvatar(avatar, {
                  image: avatar,
                  variant: "circular",
                  borderColor: colorBorder,
                  backgroundColor: backgroundColor,
                  text: text,
                  empty: false,
                  isChannel: false,
                  decrypt: false,
                })
              }
              sx={{
                width: 'clamp(60px, 8vh, 150px)',
                height: 'clamp(60px, 8vh, 150px)',
                border: `4px solid ${colorBorder}`,
                backgroundColor: `${backgroundColor}`,
              }}
            />
          );
        })}

        {avatarsAdded.map((imageType) => {
          return (
          <div key={imageType.id} className={styles.avatar}>
            <AvatarCloud
                    imageType={imageType}
                    selectedAvatar={selectedAvatar}
                    text={text}
                    handleSelectAvatar={handleSelectAvatar}
                    colorBorder={colorBorder}
                    backgroundColor={backgroundColor}
                    avatarsAdded={avatarsAdded}
                    setAvatarsAdded={setAvatarsAdded}
                  />
            </div>
          );
        })}

        <div className={styles.avatar}>
          <UploadButton
            setAvatar={setAvatarsAdded}
            borderColor={colorBorder}
            backgroundColor={backgroundColor}
            handleSelectAvatar={handleSelectAvatar}
            text={text}
          />
        </div>

      </div>

      <div className={styles.chooseColor}>
        <ChooseColor
          onSelect={handleBorder}
          textButton={textButton}
          textButtonInitial={textButtonInitial}
        />
        <ChooseColor
          onSelect={handleBackground}
          textButton={textButton}
          textButtonInitial={textButtonInitial}
        />
      </div>
    </div>
  );
}
