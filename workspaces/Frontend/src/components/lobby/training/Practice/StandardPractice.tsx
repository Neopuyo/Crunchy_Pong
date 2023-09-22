"use client";

import styles from "@/styles/lobby/training/practice/StandardPractice.module.css";
import PracticeSelector from "./PracticeSelector";

type Props = {
  selected: string;
  setSelected: Function;
};

export default function StandardTraining({ selected, setSelected }: Props) {
  // -------------------------------------Traning-------------------------------------//

  return (
    <div className={styles.chooseTraining}>
      <PracticeSelector
        title="Classic"
        points={9}
        rounds={1}
        img="Classic"
        type="Classic"
        selected={selected}
        setSelected={setSelected}
      />
      <PracticeSelector
        title="Best of 3"
        points={7}
        rounds={3}
        img="Earth"
        type="Best3"
        selected={selected}
        setSelected={setSelected}
      />
      <PracticeSelector
        title="Best of 5"
        points={5}
        rounds={5}
        img="Island"
        type="Best5"
        selected={selected}
        setSelected={setSelected}
      />
      <PracticeSelector
        title="Random"
        points={0}
        rounds={0}
        img="Random"
        type="Random"
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
