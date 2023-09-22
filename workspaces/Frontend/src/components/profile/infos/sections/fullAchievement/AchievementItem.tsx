import styles from "@/styles/profile/Achievements/Achievements.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faDumbbell,
  faG,
  faGraduationCap,
  faPeopleGroup,
  faPoo,
  faQuestion,
  faRankingStar,
  faScroll,
  faShieldHalved,
  faStar,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckCircle,
  faEnvelope,
  faHandPeace,
} from "@fortawesome/free-regular-svg-icons";
import { PongColors } from "@/lib/enums/PongColors.enum";
import {
  Badge,
  Tooltip,
} from "@mui/material";
import { UserAchievement } from "@transcendence/shared/types/Achievement.types";
import { ShortStats } from "@transcendence/shared/types/Stats.types";
import ProgressBar from "./ProgressBar";

export default function AchievementItem({
  achievement,
  stats,
  isOwner,
}: {
  achievement: UserAchievement;
  stats: ShortStats | undefined;
  isOwner: boolean;
}) {
  // Define a mapping from achievement.icone to FontAwesome icons
  const iconMapping: { [key: string]: IconProp } = {
    faHandPeace: faHandPeace,
    faPoo: faPoo,
    faRankingStar: faRankingStar,
    faPeopleGroup: faPeopleGroup,
    faDumbbell: faDumbbell,
    faScroll: faScroll,
    faVideo: faVideo,
    faGoogle: faG,
    faGraduationCap: faGraduationCap,
    faEnvelope: faEnvelope,
    faShieldHalved: faShieldHalved,
    faCloudArrowUp: faCloudArrowUp,
    faStar: faStar,
  };

  let icon: IconProp | undefined = iconMapping[achievement.icone];

  const content: number | string = achievement.value
    ? achievement.value === 1000
      ? "1k"
      : achievement.value
    : 0;

  if (!icon) icon = faQuestion;

  let color = "var(--accent1)";

  switch (achievement.type) {
    case "game":
      color = PongColors.fuschia;
      break;
    case "league":
      color = PongColors.tangerine;
      break;
    case "party":
      color = PongColors.blue;
      break;
    case "training":
      color = PongColors.mauve;
      break;
    case "demo":
      color = PongColors.appleGreen;
      break;
    case "account":
      color = PongColors.turquoise;
      break;
    case "level":
      color = PongColors.mustardYellow;
      break;
    default:
      color = "var(--tertiary1)";
  }

  const badgeStyle = {
    "& .MuiBadge-badge": {
      color: "var(--tertiary1)",
      backgroundColor: "var(--primary1)",
      border: `2px solid ${color}`,
      right: "-3px",
      top: "-3px",
    },
  };

  const background = `linear-gradient(to bottom, ${color} 55%, var(--primary1) 45%)`;

  // get stats
  let value: number = 0;

  if (stats) {
    switch (achievement.type) {
      case "game":
        if (achievement.description.startsWith("Win")) value = stats.gameWon;
        else value = stats.gameLost;
        break;
      case "party":
        if (achievement.description.startsWith("Win")) value = stats.partyWon;
        else value = stats.partyLost;
        break;
      case "league":
        if (achievement.description.startsWith("Win")) value = stats.leagueWon;
        else value = stats.leagueLost;
        break;
      case "training":
        if (achievement.description.startsWith("Win"))
          value = stats.trainingWon;
        else value = stats.trainingLost;
        break;
      case "demo":
        value = stats.demoWatched;
        break ;
      case "level":
        value = stats.userLevel;
        break ;
      default:
        break;
    }
  }

  return (
    <>
      {/* icon */}
      <div
        className={styles.left}
        style={{
          background: background,
        }}
      >
        <div className={styles.circleAround}>
          <div
            className={styles.circleInside}
            style={{ backgroundColor: color }}
          >
            <Badge
              badgeContent={content}
              overlap="circular"
              sx={badgeStyle}
              max={1000}
            >
              <FontAwesomeIcon
                icon={icon}
                color="var(--primary1)"
                className={styles.icon}
              />
            </Badge>
          </div>
        </div>
      </div>

      {/* text part */}
      <div className={styles.middle}>
        {achievement.completed && !achievement.collected && isOwner && (
          <div className={styles.collect}>
            <h4>Completed!</h4>
            <h4>
              <span>Click</span> to collect {achievement.xp}xp!
            </h4>
          </div>
        )}
        {(!achievement.completed || !isOwner ||
          (achievement.completed && achievement.collected)) && <div></div>}
        <div>
          <h5 style={{ color: color }}>{achievement.name}</h5>
          <div>{achievement.description}</div>
        </div>

        {/* load bar */}
        {!achievement.completed && achievement.value > 0 && (
          <Tooltip
            title={`${value} / ${achievement.value}`}
            placement="left"
            arrow
          >
            <div className={styles.bottom}>
              <ProgressBar
                barColor={color}
                value={(value / achievement.value) * 100}
                height={5}
              />
            </div>
          </Tooltip>
        )}
        {(achievement.completed || achievement.value === 0) && <div></div>}
      </div>

      {/* xp */}
      <div className={styles.right}>
        {!achievement.completed && (
          <div className={styles.xp}>
            <pre>{achievement.xp}xp</pre>
          </div>
        )}
        {achievement.completed && achievement.collected && (
          <div className={styles.xp}>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className={styles.icon}
              color={color}
            />
          </div>
        )}
      </div>
    </>
  );
}
