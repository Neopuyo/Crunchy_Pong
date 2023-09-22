import styles from "@/styles/profile/AvatarCard.module.css";
import { Stack } from "@mui/material";
import ColorSelector from "./ColorSelector";
import MyToggleButton from "./ToggleButton";
import SingleButton from "./SingleButton";

type Props = {
  previewChangeTopColor: (color: string) => void;
  previewChangeBotColor: (color: string) => void;
  handleArea: (newArea: "border" | "background" | null) => void;
  selectedArea: "border" | "background";
  toogleDisplaySettings: () => void;
  saveColorChanges: () => void;
};

export default function SettingsCard({
  previewChangeTopColor,
  previewChangeBotColor,
  handleArea,
  selectedArea,
  toogleDisplaySettings,
  saveColorChanges,
}: Props) {
  return (
    <div className={styles.settingsCard}>

      <Stack direction="row" spacing="2rem">
        <MyToggleButton selectedArea={selectedArea} handleArea={handleArea} />

        <Stack direction="row" spacing="0.5rem">
          <SingleButton kind={"cancel"} onClick={toogleDisplaySettings} />
          <SingleButton kind={"valid"} onClick={saveColorChanges} />
        </Stack>
      </Stack>

      <ColorSelector
        handleColorSelection={
          selectedArea === "border"
            ? previewChangeTopColor
            : previewChangeBotColor
        }
      />
    </div>
  );
}
