import styles from "@/styles/profile/ItemContent.module.css";
import WinrateBoard from "./WinrateBoard";

type Props = {
  winData: {
    gameWon: number;
    gameLost: number;
    global?: number;
    showPlaceholder?: boolean;
  };
};

export default function Winrate({ winData }: Props) {

  const winrateRender = (): JSX.Element => {
    if (winData.gameWon === 0 && winData.gameLost === 0) {
      return (
        <>
          {winData.showPlaceholder && (
            <p
              className={styles.placeholder}
            >{`It's time to start playing !`}</p>
          )}
        </>
      );
    } else {
      return <WinrateBoard winData={winData} />;
    }
  };

  return <div className={styles.main}>{winrateRender()}</div>;
}
