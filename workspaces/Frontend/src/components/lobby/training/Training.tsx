"use client";

// Import les composants react
import { useEffect, useState } from "react";

// Import du style
import styles from "@/styles/lobby/training/Training.module.css";

// Import des composants
import InTraining from "./InTraining";
import StoryTraining from "./Story/Story";

// Other imports
import TrainingService from "@/services/Training.service";
import Practice from "./Practice/Practice";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  profile: Profile;
};

export default function Training({ profile }: Props) {
  const trainingService = new TrainingService();
  const [trainingId, setTrainingId] = useState<string>("");
  const [showDemo, setShowDemo] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    trainingService.isInTraining().then((ret) => {
      setTrainingId(ret.data);
    })
    .catch (async (err: any) => {
      if (err.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
    });
  }, []);

  // -----------------------------------  TRAINING  ----------------------------------- //

  return (
    <div className={styles.training}>
      {!showDemo && (
        <InTraining
          trainingService={trainingService}
          trainingId={trainingId}
          setTrainingId={setTrainingId}
        />
      )}
      {!showDemo && (
        <StoryTraining profile={profile} trainingService={trainingService} />
      )}
      <Practice
        profile={profile}
        showDemo={showDemo}
        setShowDemo={setShowDemo}
      />
    </div>
  );
}
