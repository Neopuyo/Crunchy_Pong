import { PongColors } from "@/lib/enums/PongColors.enum";
import styles from "@/styles/profile/ColorSelector.module.css";

type Props = {
  handleColorSelection: (color: string) => void;
};

export default function ColorSelector({ handleColorSelection }: Props) {
  const colorLine1: string[] = [
    PongColors.paprika,
    PongColors.fuschia,
    PongColors.mauve,
    PongColors.violet,
    PongColors.navyBlue,
    PongColors.blue,
  ];
  const colorLine2: string[] = [
    PongColors.skyBlue,
    PongColors.turquoise,
    PongColors.emerald,
    PongColors.grassGreen,
    PongColors.appleGreen,
    PongColors.limeGreen,
  ];
  const colorLine3: string[] = [
    PongColors.canaryYellow,
    PongColors.yellow,
    PongColors.mustardYellow,
    PongColors.tangerine,
    PongColors.nightblue,
    PongColors.gray,
  ];

  const renderColorButtons = (colors: string[]) => {
    return colors.map((color) => (
      <button
        key={color}
        value={color}
        onClick={() => handleColorSelection(color)}
        className={styles.button}
        style={{
          backgroundColor: color,
        }}
      />
    ));
  };

  return (
    <div className={styles.selector}>
      <div className={styles.row}>{renderColorButtons(colorLine1)}</div>
      <div className={styles.row}>{renderColorButtons(colorLine2)}</div>
      <div className={styles.row}>{renderColorButtons(colorLine3)}</div>
    </div>
  );
}
