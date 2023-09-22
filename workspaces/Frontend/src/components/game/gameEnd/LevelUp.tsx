import styles from "@/styles/game/gameEnd/LevelUp.module.css";

type Props = {
  newLevel: number;
  setNewLevel: Function;
};

export default function LevelUp({ newLevel, setNewLevel }: Props) {
  return (
    <div className={styles.levelUp}>
      <h2 className={styles.congrats}>Congrats</h2>
      <h3 className={styles.detail}>{`You Up Level  ${newLevel} !`}</h3>
      <button className={styles.confirmBtn} onClick={() => setNewLevel(0)}>
        Confirm
      </button>
    </div>
  );
}
