"use client";
import styles from "@/styles/lobby/party/Custom.module.css";

import Selector from "@/components/lobby/selector/Selector";
import Slider from "@/components/lobby/selector/Slider";

type Props = {
  maxPoint: 3 | 5 | 7 | 9;
  setMaxPoint: Function;
  maxRound: 1 | 3 | 5 | 7 | 9;
  setMaxRound: Function;
  push: boolean;
  setPush: Function;
  pause: boolean;
  setPause: Function;
};

export default function Custom({
  maxPoint,
  setMaxPoint,
  maxRound,
  setMaxRound,
  push,
  setPush,
  pause,
  setPause,
}: Props) {
  // ----------------------------------  CHARGEMENT  ---------------------------------- //

  // -------------------------------------  RENDU  ------------------------------------ //

  return (
    <div className={styles.custom}>
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
  );
}
