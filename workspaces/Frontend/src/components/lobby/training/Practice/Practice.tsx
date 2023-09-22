"use client";

// Import les composants react
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import du style
import styles from "@/styles/lobby/training/practice/Practice.module.css";

// Import des composants
import StandardPractice from "./StandardPractice";
import CustomPractice from "./CustomPractice";
import GeneralSettings from "./GeneralSettings";

// Other imports
import { toast } from "react-toastify";
import {
  randomMaxPoint,
  randomMaxRound,
  confirmBackground,
  confirmBall,
} from "@transcendence/shared/game/random";
import TrainingService from "@/services/Training.service";
import Demo from "@/components/demo/Demo";
import LoadingComponent from "@/components/loading/Loading";
import disconnect from "@/lib/disconnect/disconnect";

type Props = {
  profile: Profile;
  showDemo: boolean;
  setShowDemo: Function;
};

export default function Practice({ profile, showDemo, setShowDemo }: Props) {
  const [selected, setSelected] = useState<
    "Classic" | "Best3" | "Best5" | "Random" | "Custom" | "Story"
  >("Classic");
  const [maxPoint, setMaxPoint] = useState<3 | 5 | 7 | 9>(3);
  const [maxRound, setMaxRound] = useState<1 | 3 | 5 | 7 | 9>(3);
  const [side, setSide] = useState<"Left" | "Right">("Left");
  const [difficulty, setDifficulty] = useState<-2 | -1 | 0 | 1 | 2>(0);
  const [push, setPush] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(false);
  const [background, setBackground] = useState<string>("Classic");
  const [ball, setBall] = useState<string>("Classic");
  const router = useRouter();
  const trainingService = new TrainingService();
  const [creatingPractice, setCreatingPractice] = useState<boolean>(false);
  const [demoData, setDemoData] = useState<CreateDemo>();

  // ----------------------------------  CREATE PONG  --------------------------------- //

  async function createPractice() {
    setCreatingPractice(true);
    const type = selected === "Random" ? "Custom" : selected;
    const settings: CreateTrainingDTO = {
      name: `Training ${selected}`,
      type: type,
      player: profile.id,
      side: side,
      maxPoint: maxPoint,
      maxRound: maxRound,
      difficulty: difficulty,
      push: push,
      pause: pause,
      background: confirmBackground(background),
      ball: confirmBall(ball),
    };

    try {
      //Creer la game
      const res = await trainingService.createTraining(settings);
      await toast.promise(new Promise((resolve) => resolve(res)), {
        pending: "Creating training...",
        success: "Training created",
        error: "Error creating training",
      });
      if (!res.success) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
          console.log(res.message);
        setCreatingPractice(false);
        return;
      }
      router.push("/home/training/" + res.data);
    } catch (error: any) {
      if (error.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
    }
  }

  useEffect(() => {
    if (selected === "Classic") {
      setMaxPoint(9);
      setMaxRound(1);
      setPush(false);
      setPause(false);
      setBackground("Classic");
      setBall("Classic");
    } else if (selected === "Best3") {
      setMaxPoint(7);
      setMaxRound(3);
      setPush(true);
      setPause(true);
      setBackground("Earth");
      setBall("Classic");
    } else if (selected === "Best5") {
      setMaxPoint(5);
      setMaxRound(5);
      setPush(true);
      setPause(true);
      setBackground("Island");
      setBall("Classic");
    } else if (selected === "Random") {
      setMaxPoint(randomMaxPoint());
      setMaxRound(randomMaxRound());
      setPush(Math.random() < 0.5);
      setPause(Math.random() < 0.5);
      setBackground("Random");
      setBall("Random");
    }
  }, [selected]);

  function lunchDemo() {
    const demo: CreateDemo = {
      name: `Demo ${selected}`,
      type: selected === "Random" ? "Custom" : selected,
      side: side,
      maxPoint: maxPoint,
      maxRound: maxRound,
      difficulty: difficulty,
      push: push,
      pause: pause,
      background: confirmBackground(background),
      ball: confirmBall(ball),
    };
    setDemoData(demo);
    setShowDemo(true);
  }

  // -----------------------------------  PRACTICE  ----------------------------------- //

  if (showDemo && demoData) {
    return (
      <div className={styles.practice}>
        <Demo
          userId={profile.id}
          login={profile.login}
          demoData={demoData}
          setShowDemo={setShowDemo}
          scrollTop={true}
        />
      </div>
    );
  }
  return (
    <div className={styles.practice}>
      <h2>Practice</h2>
      <StandardPractice selected={selected} setSelected={setSelected} />
      <CustomPractice
        selected={selected}
        setSelected={setSelected}
        maxPoint={maxPoint}
        setMaxPoint={setMaxPoint}
        maxRound={maxRound}
        setMaxRound={setMaxRound}
        push={push}
        setPush={setPush}
        pause={pause}
        setPause={setPause}
        background={background}
        setBackground={setBackground}
        ball={ball}
        setBall={setBall}
      />
      <GeneralSettings
        side={side}
        setSide={setSide}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <div className={styles.CreateDemo}>
        <button className={styles.save} onClick={createPractice}>
          {!creatingPractice && "Play"}
          {creatingPractice && <LoadingComponent />}
        </button>
        <button className={styles.save} onClick={lunchDemo}>
          Demo
        </button>
      </div>
    </div>
  );
}
