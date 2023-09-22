import styles from "@/styles/profile/ToggleButton.module.css";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Props = {
    kind: "cancel" | "valid";
    onClick: () => void;
}


export default function SingleButton({kind, onClick}: Props) {
  return (
    <div className={`${styles.singleButton} ${styles[kind]}`} onClick={onClick}>
        {kind === "valid" && <CheckCircleIcon fontSize="inherit" />}
        {kind === "cancel" && <CancelIcon fontSize="inherit" />}
    </div>
  )
}
