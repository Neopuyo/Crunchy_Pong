"use client";

// Import du style
import styles from "@/styles/demo/PongDemoHead.module.css";

// Import GameLogic
import { GameData } from "@transcendence/shared/types/Game.types";
import { MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  userId: number | undefined;
  gameData: GameData;
  setShowDemo: Function;
};

export default function PongDemoHead({ userId, gameData, setShowDemo }: Props) {
  const router = useRouter();
  function stopDemo() {
    setShowDemo(false);
    if (userId) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("stop demo");
      router.refresh();
    }
  }

  useEffect(() => {
    return () => {
      stopDemo();
    };
  }, []);

  return (
    <div className={styles.pongHead}>
      <div className={styles.leftBlock}></div>
      <h2 className={styles.title}>{gameData.name}</h2>
      <button onClick={stopDemo} className={styles.quitBtn}>
        <MdClose />
      </button>
    </div>
  );
}
