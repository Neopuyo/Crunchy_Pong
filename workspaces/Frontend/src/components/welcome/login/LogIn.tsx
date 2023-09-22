import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "@/styles/welcome/login/Login.module.css";
import LogEmail from "./LogEmail";
import LogService from "./LogService";

export default function LogInComponent() {
  const notifParam = useParams().notif;
  const router = useRouter();
  const [textButton, setTextButton] = useState<string>("Continue");
  const [register, setRegister] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [notif, setNotif] = useState<string>("");
  const [successNewPassword, setSuccessNewPassword] = useState<boolean>(false);

  // ----------------------------------  CHARGEMENT  ---------------------------------- //

  useEffect(() => {
    const setCookies = async (accessToken: string, refreshToken: string) => {
      try {
        const res = await fetch(
          `http://${process.env.HOST_IP}:3000/api/auth/setCookies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken,
              refreshToken,
            }),
          }
        );

        if (!res.ok) throw new Error("fetch setCookies failed");

        const data = await res.json();

        if (data.message === "Loading...") {
          router.push("/home");
          return;
        } else throw new Error("cant change cookies");
      } catch (error) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log(error);
        setNotif("Something went wrong, please try again!");
        setTextButton("Continue");
      }
    };

    if (login.length > 0) {
      const tokens = login.split(" ");

      if (tokens.length === 1) setCookies(tokens[0], "");
      else if (tokens.length === 2) setCookies(tokens[0], tokens[1]);
      else {
        setNotif("Something went wrong, please try again!");
        setTextButton("Continue");
      }
    }

    if (register.length !== 0 && register !== '-1') {
      router.push(`/welcome/confirm/${register}`);
      return;
    }

    if (notifParam && notifParam[0] === "wrong")
      setNotif("Something went wrong, please try again!");
  }, [register, login, router, notifParam]);

  useEffect(() => {
    if (successNewPassword)
      setTimeout(() => {
        setSuccessNewPassword(false);
      }, 5000);
  }, [successNewPassword]);

  // -------------------------------------  RENDU  ------------------------------------ //
  return (
    <main className={styles.logInPage}>
      <div className={styles.logInFrame}>
        <div className={styles.logIn}>
          <h1 className={styles.title}>Connection / Inscription</h1>

          {successNewPassword && (
            <p className={styles.success}>
              Your password has been updated! Check your email address 📧
            </p>
          )}

          <LogEmail
            notif={notif}
            setNotif={setNotif}
            textButton={textButton}
            setTextButton={setTextButton}
            setRegister={setRegister}
            setLogin={setLogin}
            setSuccessNewPassword={setSuccessNewPassword}
          />
          <div className={styles.separator}>
            <span>Or</span>
          </div>
          <LogService setTextButton={setTextButton} />
        </div>
      </div>
    </main>
  );
}
