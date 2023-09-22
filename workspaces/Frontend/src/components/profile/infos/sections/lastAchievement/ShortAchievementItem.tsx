import styles from "@/styles/profile/Achievements/LastAchievements.module.css";
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
import { faEnvelope, faHandPeace } from "@fortawesome/free-regular-svg-icons";
import { PongColors } from "@/lib/enums/PongColors.enum";
import { Badge, Tooltip } from "@mui/material";
import { UserAchievement } from "@transcendence/shared/types/Achievement.types";

export default function ShortAchievementItem({
  achievement,
  invisible = false,
}: {
  achievement: UserAchievement;
  invisible?: boolean;
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
      top: "-5px",
    },
  };

  const background = `linear-gradient(to bottom, ${color} 55%, var(--primary1) 45%)`;

  return (
    <div
      className={styles.shortAchievement}
      style={{
        background: background,
      }}
    >
      <Tooltip title={achievement.name} placement="bottom">
        <div className={styles.circleAround}>
          <div
            className={styles.circleInside}
            style={{ backgroundColor: color }}
          >
            <Badge
              badgeContent={content}
              overlap="circular"
              sx={badgeStyle}
              max={999}
              invisible={invisible}
            >
              <FontAwesomeIcon
                icon={icon}
                color="var(--primary1)"
                className={styles.icon}
              />
            </Badge>
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
