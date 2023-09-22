"use client";

import styles from "@/styles/lobby/training/story/StorySelector.module.css";
import Image from "next/image";
import { MdLock } from "react-icons/md";

type Props = {
  title: string;
  points: number;
  rounds: number;
  img: string;
  level: number;
  levelSelected: number;
  setLevelSelected: Function;
  currentLevel: number;
};

export default function StorySelector({
  title,
  points,
  rounds,
  img,
  level,
  levelSelected,
  setLevelSelected,
  currentLevel,
}: Props) {
  // -------------------------------------Traning-------------------------------------//
  const isActive = level - 1 === levelSelected;
  const isDisabled = level > currentLevel + 1;

  let buttonClass = styles.inactive;
  let detailClass = styles.detail;
  if (isActive) {
    buttonClass = styles.active;
  } else if (isDisabled && img !== "classic") {
    buttonClass = styles.disabled;
    detailClass = `${styles.detail} ${styles.blur}`;
  }

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    if (level <= currentLevel + 1) {
      setLevelSelected(level - 1);
    }
  };

  return (
    <div className={styles.storySelector}>
      <h3>{`Level ${level}`}</h3>
      <button
        className={buttonClass}
        key={title}
        onClick={(event) => handleChange(event)}
        disabled={isDisabled}
      >
        <h4>{`${title}`}</h4>
        <div className={detailClass}>
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
        </div>
      </button>
      {isDisabled && (
        <div className={styles.lock}>
          <MdLock />
        </div>
      )}
    </div>
  );
}
