"use client";

//Import les composants react
import { MdLogout, MdPlayArrow } from "react-icons/md";

//Import le service pour les games
import TrainingService from "@/services/Training.service";
import styles from "@/styles/lobby/training/InTraining.module.css";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import disconnect from "@/lib/disconnect/disconnect";

type Props = {
  trainingService: TrainingService;
  trainingId: string;
  setTrainingId: Function;
};

export default function InTraining({
  trainingService,
  trainingId,
  setTrainingId,
}: Props) {
  const router = useRouter();

  function resumeGame(trainingId: string) {
    router.push(`home/training/${trainingId}`);
    toast.success("You are back in training");
  }

  async function quitTraining() {
    try {
      const ret = await trainingService.quitTraining(trainingId);
      await toast.promise(new Promise((resolve) => resolve(ret)), {
        pending: "Leaving training...",
        success: "You have left this training",
        error: "Error leaving training",
      });
      setTrainingId("");
    } catch (err: any) {
      if (err.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
    }
  }

  if (!trainingId) return;

  return (
    <div className={styles.inTraining}>
      <h2>You have a current training</h2>
      <div className={styles.inGameChoice}>
        <button
          className={styles.resumeBtn}
          onClick={() => resumeGame(trainingId)}
        >
          <MdPlayArrow />
          Resume
        </button>
        <button className={styles.quitBtn} onClick={() => quitTraining()}>
          <MdLogout />
          Quit
        </button>
      </div>
      <div className={styles.barBottom}></div>
    </div>
  );
}
