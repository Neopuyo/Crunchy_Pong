"use client";

import { checkLoginFormat } from "@/lib/create/checkLogin";
import ChooseAvatar from "./ChooseAvatar";
import styles from "@/styles/createLogin/FormLogin.module.css";
import { useEffect, useRef, useState } from "react";
import { handleActionServer } from "@/lib/create/handleActionServer";
import { useRouter } from "next/navigation";
import { PongColors } from "@/lib/enums/PongColors.enum";
import { uniqueNamesGenerator, names, Config } from "unique-names-generator";
import { MdRefresh } from "react-icons/md";
import { filterBadWords } from "@/lib/bad-words/filterBadWords";
import disconnect from "@/lib/disconnect/disconnect";
import { toast } from "react-toastify";

export default function FormLogin({
  avatars,
  token,
  avatarCrypted,
  profile,
}: {
  avatars: string[];
  token: string;
  avatarCrypted: string | undefined;
  profile: Profile;
}) {
  const textButtonInitial = "Let's go!";
  const [notif, setNotif] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [access_token, setAccessToken] = useState<string>("");
  const [refresh_token, setRefreshToken] = useState<string>("");
  const [textButton, setTextButton] = useState<string>(textButtonInitial);
  const router = useRouter();
  const config: Config = {
    dictionaries: [names],
    length: 1,
    separator: "-",
    style: "capital",
  };
  const avatarChosenRef = useRef<Avatar>({
    image: "",
    variant: "circular",
    borderColor: PongColors.appleGreen,
    backgroundColor: PongColors.appleGreen,
    text: "",
    empty: true,
    isChannel: false,
    decrypt: false,
  });

  useEffect(() => {
    if (
      profile.provider === "42" &&
      profile.first_name &&
      profile.first_name.length !== 0
    )
      setText(profile.first_name);
  }, []);

  const selectAvatar = (avatar: Avatar) => {
    avatar.text = avatar.text.toUpperCase().slice(0, 3);
    avatarChosenRef.current = avatar;
  };

  const borderColor = (color: string) => {
    avatarChosenRef.current.borderColor = color;
  };

  const backgroundColor = (color: string) => {
    avatarChosenRef.current.backgroundColor = color;
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    avatarChosenRef.current.text = text.toUpperCase().slice(0, 3);
    setText(text);
  };

  const generateRandomName = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (textButton === textButtonInitial) {
      const randomName = uniqueNamesGenerator(config);
      const text = randomName;
      avatarChosenRef.current.text = text.toUpperCase().slice(0, 3);
      setText(text);
    }
  };

  useEffect(() => {
    const changeCookie = async () => {
      try {
        const res = await fetch(
          `http://${process.env.HOST_IP}:3000/api/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token,
              refresh_token,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok || data.error) throw new Error();

        router.push("/home?home");
      } catch (error) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log(error);
        setNotif("Something went wrong, please try again");
        setTextButton(textButtonInitial);
      }
    };

    if (access_token && access_token.length > 0) changeCookie();
  }, [access_token, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setTextButton("Loading...");

    try {
      const loginUser = e.target.login.value;

      const loginBadWords = filterBadWords(loginUser);

      if (loginBadWords !== loginUser) {
        setTextButton(textButtonInitial);
        setNotif("What a bad word! 😱");
        setText("");
        return;
      }

      const loginChecked = checkLoginFormat(loginUser);
      setNotif(loginChecked);

      if (loginChecked.length > 0) {
        setTextButton(textButtonInitial);
        return;
      }

      const res: {
        exists: string;
        access_token: string;
        refresh_token: string;
      } = await handleActionServer(loginUser, avatarChosenRef.current, token);

      if (res.access_token.length === 0) setTextButton(textButtonInitial);

      setNotif(res.exists);
      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);
    } catch (err: any) {
      if (err.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
      toast.error("Something went wrong, please try again!");
      setTextButton(textButtonInitial);
    }
  };

  return (
    <main className={styles.formLoginPage}>
      <div className={styles.formLoginFrame}>
        <div className={styles.formLogin}>
          <h1 className={styles.title}>You are almost there! 😁</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="inputId" className={styles.description}>
              Please choose your login!
            </label>
            <p className={styles.little}>
              Don&apos;t worry, you can change it later.
            </p>

            <div className={styles.nameContainer}>
              <input
                type="text"
                name="login"
                placeholder="login"
                maxLength={20}
                value={text}
                onChange={handleText}
                className={styles.login}
                id="inputId"
              />
              <button
                className={styles.randomBtn}
                onClick={generateRandomName}
                type="button"
                title="random login"
              >
                <MdRefresh />
              </button>
            </div>

            {notif.length > 0 && <div className={styles.notif}>{notif}</div>}
            <p className={styles.choose}>Make you pretty:</p>

            <div className={styles.avatars}>
              <ChooseAvatar
                selectBorder={borderColor}
                selectBackground={backgroundColor}
                selectAvatar={selectAvatar}
                text={text}
                avatars={avatars}
                avatarCrypted={avatarCrypted}
                fontSize="1.3rem"
                textButton={textButton}
                textButtonInitial={textButtonInitial}
              />
            </div>

            <button
              title="Create avatar"
              type="submit"
              className={styles.confirmBtn}
              disabled={textButton !== textButtonInitial}
            >
              {textButton}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
