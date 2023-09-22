"use client";

// Import du style
import styles from "@/styles/gameSolo/PongHeadSolo.module.css";

// Import GameLogic
import { GameData } from "@transcendence/shared/types/Game.types";
import { MdClose } from "react-icons/md";
import TrainingService from "@/services/Training.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Profile_Service from "@/services/Profile.service";
import disconnect from "@/lib/disconnect/disconnect";
import { useState } from "react";

type Props = {
  profile: Profile;
  gameData: GameData;
  trainingService: TrainingService;
};

export default function PongHead({
  profile,
  gameData,
  trainingService,
}: Props) {
  const router = useRouter();
  const profileService = new Profile_Service();
  const [gameKey, setGameKey] = useState<"Arrow" | "ZQSD" | "WASD">(
    profile.gameKey
  );
  const [prof, setProf] = useState<Profile>(profile);

  async function quitTraining() {
    if (gameData && gameData.status !== "Finished") {
      await trainingService.quitTraining(gameData.id);
    }
    router.push("/home?home");
  }

  async function changeKey() {
    const selectedValue =
      gameKey === "Arrow" ? "ZQSD" : gameKey === "ZQSD" ? "WASD" : "Arrow";

    if (
      selectedValue === "Arrow" ||
      selectedValue === "ZQSD" ||
      selectedValue === "WASD"
    ) {
      setGameKey(selectedValue);
      const rep: Rep = await profileService.editUser({
        gameKey: selectedValue,
      });
      if (rep.success) {
        const updatedProfile = profile;
        updatedProfile.gameKey = selectedValue;
        setProf(updatedProfile);
      } else {
        if (rep.message === "disconnect") {
          await disconnect();
          router.refresh();
          return;
        }
      }
    }
  }

  return (
    <div className={styles.pongHead}>
      <button onClick={changeKey} className={styles.keyBtn}>
        {gameKey === "Arrow" && "↑↓"}
        {gameKey === "ZQSD" && "ZS"}
        {gameKey === "WASD" && "WS"}
      </button>
      <h2 className={styles.title}>{gameData.name}</h2>
      <button onClick={quitTraining} className={styles.quitBtn}>
        <MdClose />
      </button>
    </div>
  );
}
