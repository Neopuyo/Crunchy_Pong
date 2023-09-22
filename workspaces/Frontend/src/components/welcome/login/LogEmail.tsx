"use client";

import {
  loginPassword,
  registerFormEmail,
  registerFormPassword,
} from "@/lib/auth/registerForm";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import styles from "@/styles/welcome/login/LogEmail.module.css";
import { CryptoService } from "@/services/Crypto.service";

const Crypto = new CryptoService();

type FormInputs = {
  [key: string]: string;
};

type Props = {
  notif: string;
  setNotif: Function;
  textButton: string;
  setTextButton: Function;
  setRegister: Function;
  setLogin: Function;
  setSuccessNewPassword: Dispatch<SetStateAction<boolean>>;
};

export default function LogEmail({
  notif,
  setNotif,
  textButton,
  setTextButton,
  setRegister,
  setLogin,
  setSuccessNewPassword,
}: Props) {

  const initialTextForget = "Forgot your password?";
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<boolean>(false);
  const [passwordSecured, setPasswordSecured] = useState<string>("");
  const [sendPassword, setSendPassword] = useState<string>(initialTextForget);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { handleSubmit, setValue } = useForm<FormInputs>();
  let exists = useRef<boolean>(false);

  const handleCaptcha = async () => {
    if (!executeRecaptcha) {
      throw new Error("Captcha not ready");
    }

    const token = await executeRecaptcha("enquiryFormSubmit");

    const response = await fetch(
      `http://${process.env.HOST_IP}:3000/api/auth/captcha`,
      {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gRecaptchaToken: token,
        }),
      }
    );

    const notifCaptcha = await response.json();

    if (notifCaptcha?.status !== "ok") throw new Error();
  };

  const iconEmail = () => {
    setEmail("");
    setNotif("");
    setPasswordSecured("");
    setTextButton("Continue");
    setPassword(false);
    setSendPassword(initialTextForget);
    exists.current = false;
    return;
  };

  const submit = async (data: FormInputs) => {
    setTextButton("Loading...");
    setNotif("");

    try {
      
      if (process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev"
        && process.env.HOST_IP && process.env.HOST_IP === "localhost")
        await handleCaptcha();

      // if user has forgotten his password
      if (sendPassword !== initialTextForget) {
        const emailCrypted = await Crypto.encrypt(email);

        const res = await fetch(
          `http://${process.env.HOST_IP}:4000/api/auth/forgotPassword`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: emailCrypted,
            }),
          }
        );

        if (!res.ok) throw new Error("fetch failed");

        const data = await res.json();

        if (data.success) {
          setSendPassword(initialTextForget);
          setTextButton("Continue");
          setSuccessNewPassword(true);
          return;
        }

        throw new Error("no success");
      }

      //if email only, first step of authentification
      const emailUser = data.email;
      if (email.length === 0) {
        setEmail(emailUser);

        const res: {
          emailExists: boolean;
          notif: boolean;
        } = await registerFormEmail(emailUser);

        if (res.notif) {
          setEmail("");
          throw new Error();
        }

        setPassword(true);

        if (res.emailExists) exists.current = true;

        setTextButton("Continue");
        return;
      }

      // password step
      const passwordUser = data.password;

      let res: {
        passwordSecured: string;
        register: string;
        login: string;
      } = { passwordSecured: "", register: '', login: "" };

      if (!exists.current)
        res = await registerFormPassword(passwordUser, email);
      else res = await loginPassword(passwordUser, email);

      setPasswordSecured(res.passwordSecured);

      if (res.register.length === 0 && res.login.length === 0)
        setTextButton("Continue");

      if (res.register === "-1") {
        setEmail("");
        setPassword(false);
        setPasswordSecured("");
        setTextButton("Continue");
        setNotif("Your account has already been created, please log again!");
        return ;
      }

      setRegister(res.register);
      setLogin(res.login);
    } catch (error) {
      if (sendPassword !== initialTextForget)
        setTextButton("Send new password by mail");
      else setTextButton("Continue");
      setNotif("Something went wrong, please try again!");
    }
  };

  const handlePasswordForgotten = () => {
    setNotif("");
    setPasswordSecured("");

    if (sendPassword === initialTextForget) {
      setSendPassword(
        "You can get a new password by email. Click again to cancel."
      );
      setTextButton("Send new password by mail");
    } else {
      setTextButton("Continue");
      setSendPassword(initialTextForget);
    }
  };

  // -------------------------------------  RENDU  ------------------------------------ //
  return (
    <form onSubmit={handleSubmit(submit)} className={styles.logEmail}>
      <p className={styles.description}>
        Enter your email to log in or register your account
      </p>
      { email.length === 0 && 
        <input
          type="email"
          autoComplete="Email"
          placeholder="Email"
          name="email"
          className={styles.input}
          required
          onChange={(event) =>
            setValue("email", (event.target as HTMLInputElement).value)
          }
        />
      }

      {email.length > 0 && (
        <div className={styles.email}>
          {email}
          <div className={styles.emailBtn} onClick={iconEmail}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </div>
        </div>
      )}

      <div className={password ? styles.openPassword : styles.closePassword}>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          name="password"
          className={styles.input}
          required={password && textButton !== "Send new password by mail"}
          onChange={(event) =>
            setValue("password", (event.target as HTMLInputElement).value)
          }
          style={{ width: "60%" }}
        />
        {passwordSecured.length > 0 && (
          <div className={styles.notif}>{passwordSecured}</div>
        )}

        {password && exists.current && (
          <p>
            <span onClick={handlePasswordForgotten}>{sendPassword}</span>
          </p>
        )}
      </div>

      {notif.length > 0 && <div className={styles.notif}>{notif}</div>}

      <button
        type="submit"
        disabled={textButton === "Loading..."}
        className={styles.continueBtn}
      >
        {textButton}
      </button>
    </form>
  );
}
