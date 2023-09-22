"use client";

import styles from "@/styles/lobby/training/practice/PracticeSelector.module.css";
import Image from "next/image";

type Props = {
  title: string;
  points: number;
  rounds: number;
  img: string;
  type: "Classic" | "Best3" | "Best5" | "Random";
  selected: string;
  setSelected: Function;
};

export default function PracticeSelector({
  title,
  points,
  rounds,
  img,
  type,
  selected,
  setSelected,
}: Props) {
  // -------------------------------------Traning-------------------------------------//
  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setSelected(type);
  };

  return (
    <button
      className={type === selected ? styles.active : styles.inactive}
      key={title}
      onClick={(event) => handleChange(event)}
    >
      <h3>{`${title}`}</h3>
      <div className={styles.info}>
        <p>{`Points: ${points === 0 ? "?" : points}`}</p>
        <p>{`Rounds: ${rounds === 0 ? "?" : rounds}`}</p>
      </div>
      <div>
        <Image
          src={`/images/background/${img}.png`}
          alt={img}
          width={135}
          height={80}
        />
      </div>
    </button>
  );
}
