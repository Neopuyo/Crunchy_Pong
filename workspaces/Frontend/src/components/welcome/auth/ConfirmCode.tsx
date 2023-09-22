"use client";

import sendNewCode from "@/lib/auth/sendNewCode";
import styles from "@/styles/welcome/auth/Confirm.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormInputs = {
  [key: string]: string;
};

export default function ConfirmEmailCode({ userId }: { userId: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [textButton, setTextButton] = useState<string>("Verify");
  const { handleSubmit, setValue } = useForm<FormInputs>();
  const inputRefs = React.useRef<HTMLInputElement[]>([]);

  if (isNaN(userId)) {
    toast.error("Something went wrong, please log again!");
    router.replace("/welcome");
  }

  const indexes: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
  const inputs = indexes.map((index) => {
    let mid = false;
    if (index === 4) mid = true;
    return (
      <React.Fragment key={index}>
        {mid && <div>-</div>}
        <input
          defaultValue=""
          ref={(ref) => (ref ? (inputRefs.current[index] = ref) : null)}
          type="text"
          maxLength={1}
          onFocus={(event) => handleFocus(event)}
          onInput={(event) =>
            moveToNextInput(index, (event.target as HTMLInputElement).value)
          }
          onKeyDown={(event) => handleKeyDown(index, event)}
          onClick={(event) => selectCharacter(event)}
          required
        />
      </React.Fragment>
    );
  });

  const moveToNextInput = (i: number, value: string) => {
    setValue(i.toString(), value);
    if (value && i < inputs.length) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    i: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;

    if (!value && event.key == "Backspace" && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const selectCharacter = (event: React.MouseEvent<HTMLInputElement>) => {
    event?.currentTarget.select();
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event?.currentTarget.value) event?.currentTarget.select();
  };

  const onSubmit = async (data: FormInputs) => {
    setMsg("");
    setTextButton("Loading...");
    const code = Object.values(data).join("").toUpperCase();

    try {
      const response = await fetch(
        `http://${process.env.HOST_IP}:3000/api/auth/verify?code=${code}&id=${userId}`
      );

      if (!response.ok) throw new Error("fetch failed");

      const data = await response.json();

      if (data.error) {
        toast.error("Something went wrong, please log in again!");
        router.replace("/welcome/login");
        return;
      }

      if (!data.success) {
        setMsg(data.message);
        setTextButton("Verify");
        return;
      }

      if (data.success) {
        router.push("/home");
        return;
      }

      throw new Error("no success");
    } catch (err) {
      toast.info("Something went wrong, please try again!");
      setTextButton("Verify");
    }
  };

  const sendCode = async () => {
    setTextButton("Loading...");
    setMsg("");

    try {
      const data = await sendNewCode(userId);

      if (!data || !data.success) throw new Error("no success");
      if (data.success) {
        toast.success("A new code has been sent to your email address!");
        setTextButton("Verify");
      }
    } catch (error: any) {
      toast.info("Something went wrong, please try again!");
      setTextButton("Verify");
    }
  };

  return (
    <main className={styles.confirmEmailPage}>
      <div className={styles.confirmEmailFrame}>
        <div className={styles.confirmEmail}>
          <h1 className={styles.title}>Confirm Email</h1>
          <p className={styles.description}>
            Please enter the verification code sent to your email address!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.code}>
            <div className={styles.inputCode}>{inputs}</div>
            <p className={styles.msg}>{msg}</p>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={textButton !== "Verify"}
            >
              {textButton}
            </button>
          </form>

          <div className={styles.bottomText}>
            <p>Did not receive any code?</p>
            <button
              className={styles.again}
              onClick={sendCode}
              disabled={textButton !== "Verify"}
            >
              Send code again
            </button>
            <Link className={styles.again} href="/welcome/login">
              Log in with an other email
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
