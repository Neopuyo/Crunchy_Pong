"use client";

import styles from "@/styles/lobby/training/practice/CustomPractice.module.css";
import ImgSelector from "@/components/lobby/selector/ImgSelector";
import Selector from "@/components/lobby/selector/Selector";
import Slider from "@/components/lobby/selector/Slider";
import {
  BACKGROUND,
  BALL,
} from "@transcendence/shared/constants/Asset.constants";

type Props = {
  selected: string;
  setSelected: Function;
  maxPoint: 3 | 5 | 7 | 9;
  setMaxPoint: Function;
  maxRound: 1 | 3 | 5 | 7 | 9;
  setMaxRound: Function;
  push: boolean;
  setPush: Function;
  pause: boolean;
  setPause: Function;
  background: string;
  setBackground: Function;
  ball: string;
  setBall: Function;
};

export default function CustomPractice({
  selected,
  setSelected,
  maxPoint,
  setMaxPoint,
  maxRound,
  setMaxRound,
  push,
  setPush,
  pause,
  setPause,
  background,
  setBackground,
  ball,
  setBall,
}: Props) {
  // -------------------------------------Traning-------------------------------------//

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    if (selected === "Custom") {
      setSelected("Classic");
    } else {
      setSelected("Custom");
    }
  };

  if (selected !== "Custom") {
    return (
      <button
        className={styles.inactive}
        onClick={(event) => handleChange(event)}
      >
        <h3>Custom</h3>
        <p className={styles.details}>It is time for you to decide</p>
      </button>
    );
  }
  return (
    <div className={styles.customTraining}>
      <button
        className={styles.active}
        onClick={(event) => handleChange(event)}
      >
        <h3>Custom</h3>
        <p className={styles.details}>It is time for you to decide</p>
      </button>
      <div className={styles.settings}>
        {/* Push */}
        <div className={styles.set}>
          <label className={styles.section}>Push</label>
          <Selector id="push" value={push} setValue={setPush} />
        </div>

        {/* Pause */}
        <div className={styles.set}>
          <label className={styles.section}>Pause</label>
          <Selector id="pause" value={pause} setValue={setPause} />
        </div>

        {/* Score */}
        <div className={styles.set}>
          <label className={styles.section}>Score</label>
          <Slider
            min={3}
            max={9}
            step={1}
            value={maxPoint}
            setValue={setMaxPoint}
            adjust={0}
          />
        </div>

        {/* Round */}
        <div className={styles.set}>
          <label className={styles.section}>Round</label>
          <Slider
            min={1}
            max={9}
            step={2}
            value={maxRound}
            setValue={setMaxRound}
            adjust={0}
          />
        </div>
      </div>

      <div className={styles.gameImage}>
        {/* Background */}
        <div className={styles.background}>
          <h4 className={styles.section}>Practice Field</h4>
          <ImgSelector
            type={"background"}
            value={background}
            setValue={setBackground}
            imgs={BACKGROUND}
            width={135}
            height={80}
            disabled={false}
          />
        </div>

        {/* Ball */}
        <div className={styles.ball}>
          <h4 className={styles.section}>Practice Ball</h4>
          <ImgSelector
            type={"ball"}
            value={ball}
            setValue={setBall}
            imgs={BALL}
            width={30}
            height={30}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
