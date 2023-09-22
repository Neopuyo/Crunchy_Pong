import styles from "@/styles/lobby/selector/Selector.module.css";

type Props = {
  id: string;
  value: "Left" | "Right";
  setValue: Function;
};

export default function Selector({ id, value, setValue }: Props) {
  const handleChangeRight = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    if (value === "Left") {
      setValue("Right");
    }
  };
  const handleChangeLeft = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    if (value === "Right") {
      setValue("Left");
    }
  };
  return (
    <div className={styles.selector}>
      <button
        id={id}
        name="sideSelector"
        value="Left"
        className={value === "Left" ? styles.activeBtn : styles.inactiveBtn}
        onClick={handleChangeLeft}
      >
        Left
      </button>
      <button
        id={id}
        name="sideSelector"
        value="Right"
        className={value === "Right" ? styles.activeBtn : styles.inactiveBtn}
        onClick={handleChangeRight}
      >
        Right
      </button>
    </div>
  );
}
