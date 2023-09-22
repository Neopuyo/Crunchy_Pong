"use client";

import styles from "@/styles/lobby/league/DefineType.module.css";
import PracticeSelector from "../training/Practice/PracticeSelector";

type Props = {
  type: string;
  setType: Function;
};

export default function DefineType({ type, setType }: Props) {
  return (
    <div className={styles.defineType}>
      {/* Classic */}
      <PracticeSelector
        title="Classic"
        points={9}
        rounds={1}
        img="Classic"
        type="Classic"
        selected={type}
        setSelected={setType}
      />

      {/* Best 3 */}
      <PracticeSelector
        title="Best of 3"
        points={7}
        rounds={3}
        img="Earth"
        type="Best3"
        selected={type}
        setSelected={setType}
      />

      {/* Best 5 */}
      <PracticeSelector
        title="Best of 5"
        points={5}
        rounds={5}
        img="Island"
        type="Best5"
        selected={type}
        setSelected={setType}
      />
    </div>
  );
}
