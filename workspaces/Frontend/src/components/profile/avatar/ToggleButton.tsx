import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";
import { ReactNode } from "react";
import styles from "@/styles/profile/ToggleButton.module.css";

type Props = {
  handleArea: (newArea: "border" | "background" | null) => void;
  selectedArea: "border" | "background";
};

type ToggleProps = {
  children: ReactNode;
  value: "border" | "background";
  side: "left" | "right";
};

export default function ToggleButton({ handleArea, selectedArea }: Props) {

  const Toggle = ({ children, value, side }: ToggleProps) => {
    return (
      <div
        onClick={() => handleArea(value)}
        className={`${styles.button} ${styles[side]} ${
          value === selectedArea && styles.selected
        }`}
      >
        {children}
      </div>
    );
  };

  return (
    <div className={styles.buttonGroup}>
      <Toggle value="border" side="left">
        <RadioButtonUncheckedIcon fontSize="inherit" />
      </Toggle>

      <Toggle value="background" side="right">
        <CircleIcon fontSize="inherit" />
      </Toggle>
    </div>
  );
}
