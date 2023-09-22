"use client";

import styles from "@/styles/lobby/party/DefineType.module.css";
import {
  MdStar,
  Md3GMobiledata,
  Md5G,
  MdSettings,
  MdQuestionMark,
} from "react-icons/md";

import Custom from "@/components/lobby/party/Custom";

type Props = {
  selected: "Classic" | "Best3" | "Best5" | "Random" | "Custom";
  setSelected: Function;
  maxPoint: 3 | 5 | 7 | 9;
  setMaxPoint: Function;
  maxRound: 1 | 3 | 5 | 7 | 9;
  setMaxRound: Function;
  push: boolean;
  setPush: Function;
  pause: boolean;
  setPause: Function;
};

export default function DefineType({
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
}: Props) {
  return (
    <div className={styles.defineType}>
      <div className={styles.type}>
        {/* Classic */}
        <button
          className={
            selected === "Classic" ? styles.activeBtn : styles.inactiveBtn
          }
          onClick={() => setSelected("Classic")}
        >
          <MdStar size={40} />
          <h3>Classic</h3>
        </button>

        {/* Best 3 */}
        <button
          className={
            selected === "Best3" ? styles.activeBtn : styles.inactiveBtn
          }
          onClick={() => setSelected("Best3")}
        >
          <Md3GMobiledata size={40} />
          <h3>Best 3</h3>
        </button>

        {/* Best 5 */}
        <button
          className={
            selected === "Best5" ? styles.activeBtn : styles.inactiveBtn
          }
          onClick={() => setSelected("Best5")}
        >
          <Md5G size={40} />
          <h3>Best 5</h3>
        </button>

        {/* Random */}
        <button
          className={
            selected === "Random" ? styles.activeBtn : styles.inactiveBtn
          }
          onClick={() => setSelected("Random")}
        >
          <MdQuestionMark size={40} />
          <h3>Random</h3>
        </button>

        {/* Custom */}
        <button
          className={
            selected === "Custom" ? styles.activeBtn : styles.inactiveBtn
          }
          onClick={() => setSelected("Custom")}
        >
          <MdSettings size={40} />
          <h3>Custom</h3>
        </button>
      </div>
      {selected === "Custom" && (
        <Custom
          maxPoint={maxPoint}
          setMaxPoint={setMaxPoint}
          maxRound={maxRound}
          setMaxRound={setMaxRound}
          push={push}
          setPush={setPush}
          pause={pause}
          setPause={setPause}
        />
      )}
    </div>
  );
}
