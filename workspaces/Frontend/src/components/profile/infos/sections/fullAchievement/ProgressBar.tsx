import styles from "@/styles/profile/Achievements/ProgressBar.module.css";

type Props = {
  barColor:string;
  value:number;
  height:number;
}

export default function ProgressBar({barColor, value, height}: Props) {

  if (value < 0) {
    value = 0;
  } else if (value > 100) {
    value = 100;
  }

  if (height < 0) {
    height = 0;
  } else if (height > 30) {
    height = 30;
  }

  return (
    <div className={styles.frame} style={{height: `${height}px`}}>
      <div className={styles.progressBar} style={{borderRadius: `${height / 2}px`}}>
        <div className={styles.coloredBar} style={{width: `${value}%`, backgroundColor: `${barColor}`, borderRadius: `${height / 2}px`}}></div>
      </div>
    </div>
  )
}
