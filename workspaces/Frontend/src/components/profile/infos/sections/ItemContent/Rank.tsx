import styles from "@/styles/profile/ItemContent.module.css";
import {
  faHippo, IconDefinition, faDragon, faOtter, faKiwiBird, faFishFins, faCow, faSeedling
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  rank:number;
  leaguePoints:number;
}

export default function Rank({rank, leaguePoints}:Props) {

  const getIcon = ():IconDefinition => {
    if (!rank)
      return faSeedling;

    switch (true) {
      case rank <= 0:
        return faSeedling;
      case rank === 1:
        return faDragon;
      case rank === 2:
        return faOtter; 
      case rank === 3:  
        return faKiwiBird;
      case rank < 6:
        return faFishFins;
      case rank < 12:
        return faHippo; 
      default:
        return faCow;
    }
  }

  return (
    <div className={styles.main}>

      <div className={styles.rankLetters}>RANK</div>

      <div className={styles.rankBox}>
        <div className={styles.rankMedal}>
          <FontAwesomeIcon icon={getIcon()}/>
        </div>
        <div className={styles.column} style={{backgroundColor : "var(--primary1)", minHeight : "80px"}}>
          <div className={styles.rankNumber} style={{fontSize: (!rank || rank <= 0) ? "1.5rem" : ""}}>
            {(!rank || rank <= 0) ? "unranked" : rank}
          </div>
          <div className={styles.row} style={{alignItems: "baseline",}}>
            <div className={styles.leaguePoints}>{leaguePoints}</div>
            <div className={styles.leaguePointsLabel}>LP</div>
          </div>
        </div>
      </div>

  </div>
  )
}