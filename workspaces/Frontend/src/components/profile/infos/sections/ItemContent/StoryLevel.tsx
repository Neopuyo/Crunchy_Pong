import styles from "@/styles/profile/ItemContent.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid  } from "@fortawesome/free-solid-svg-icons";

type Props = {
    storyLevel:number;
}

export default function StoryLevel({storyLevel}:Props) {

const starRender = ():JSX.Element | JSX.Element[] => {
    const stars:JSX.Element[] = [];
    for (let i = 0; i < 10; i++) {
        stars.push(
            <FontAwesomeIcon key={i} className={styles.star} icon={i < storyLevel ? faStarSolid : faStarRegular} style={{color: i < storyLevel ? "var(--accent1)" : "var(--secondary3)"}}/>
        )
    }
    return stars;
}

  return (
    <div className={styles.main}>
        <div className={styles.starBox}>{starRender()}</div>
    </div>
  )
}
