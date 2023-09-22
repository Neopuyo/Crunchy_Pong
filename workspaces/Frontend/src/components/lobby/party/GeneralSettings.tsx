"use client";

import styles from "@/styles/lobby/party/GeneralSettings.module.css";
import SideSelector from "@/components/lobby/selector/SideSelector";
import Slider from "@/components/lobby/selector/Slider";

type Props = {
  side: "Left" | "Right";
  setSide: Function;
  speed: -2 | -1 | 0 | 1 | 2;
  setSpeed: Function;
};

export default function GeneralSettings({
  side,
  setSide,
  speed,
  setSpeed,
}: Props) {
  // -------------------------------------Traning-------------------------------------//

  return (
    <div className={styles.generalSettings}>
      {/* Side */}
      <div className={styles.set}>
        <label className={styles.section}>Side</label>
        <SideSelector id="side" value={side} setValue={setSide} />
      </div>
      {/* Difficulty */}
      <div className={styles.set}>
        <label className={styles.section}>Speed</label>
        <Slider
          min={1}
          max={5}
          step={1}
          value={speed}
          setValue={setSpeed}
          adjust={-3}
        />
      </div>
    </div>
  );
}
