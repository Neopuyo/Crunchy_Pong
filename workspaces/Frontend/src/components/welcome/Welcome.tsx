"use client";

import styles from "@/styles/welcome/Welcome.module.css";
import { useParams } from "next/navigation";
import DisconnectClient from "../disconnect/DisconnectClient";
import {
  confirmBackground,
  confirmBall,
} from "@transcendence/shared/game/random";
import { useState } from "react";
import Demo from "@/components/demo/Demo";
import Link from "next/link";

export default function Welcome() {
  const notif = useParams().notif;
  const [showClassic, setShowClassic] = useState<boolean>(false);
  const [showCrunchy, setShowCrunchy] = useState<boolean>(true);
  const classic: CreateDemo = {
    name: `Classic`,
    type: "Custom",
    side: "Left",
    maxPoint: 9,
    maxRound: 1,
    difficulty: -2,
    push: false,
    pause: false,
    background: confirmBackground("Classic"),
    ball: confirmBall("Classic"),
  };
  const crunchy: CreateDemo = {
    name: `Crunchy Pong`,
    type: "Custom",
    side: "Right",
    maxPoint: 9,
    maxRound: 5,
    difficulty: 2,
    push: true,
    pause: true,
    background: confirmBackground("Random"),
    ball: confirmBall("Random"),
  };

  return (
    <div className={styles.welcome}>
      {/* Disconnect client if notif in url */}
      {notif && notif[0] === "notif" && <DisconnectClient />}

      {/* Title */}
      <h2>
        Welcome To <span>Crunchy Pong!</span>
      </h2>

      {/* Description */}
      <p>Play against the world and become the number one Ponger! 😎</p>
      <p>Meet people, make friends and have fun! 🏓</p>

      {/* Signup */}
      <div className={styles.signup}>
        <Link href="/welcome/login" className={styles.log}>
          Log In
        </Link>
        <p>and start your journey!</p>
      </div>

      <div className={styles.demo}>
        {!showClassic && (
          <button
            onClick={() => {
              setShowClassic(true);
              setShowCrunchy(false);
            }}
            className={styles.demoBtn}
            type="button"
          >
            {showCrunchy && "Change to Classic Pong"}
            {!showCrunchy && "Show Classic Pong"}
          </button>
        )}
        {!showCrunchy && (
          <button
            onClick={() => {
              setShowCrunchy(true);
              setShowClassic(false);
            }}
            className={styles.demoBtn}
            type="button"
          >
            {showClassic && "Change to Crunchy Pong"}
            {!showClassic && "Show Crunchy Pong"}
          </button>
        )}
      </div>
      {showClassic && (
        <Demo
          userId={undefined}
          login={"Grandpa"}
          demoData={classic}
          setShowDemo={setShowClassic}
          scrollTop={false}
        />
      )}
      {showCrunchy && (
        <Demo
          userId={undefined}
          login={"You"}
          demoData={crunchy}
          setShowDemo={setShowCrunchy}
          scrollTop={false}
        />
      )}
    </div>
  );
}
