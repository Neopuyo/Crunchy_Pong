import styles from "@/styles/profile/Achievements/Achievements.module.css";
import { useEffect, useState } from "react";
import AchievementService from "@/services/Achievement.service";
import disconnect from "@/lib/disconnect/disconnect";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  FullAchivement,
  UserAchievement,
} from "@transcendence/shared/types/Achievement.types";
import HeaderAchievement from "./HeaderAchievement";
import AchievementItem from "./AchievementItem";
import { ShortStats } from "@transcendence/shared/types/Stats.types";
import { Socket } from "socket.io-client";

type Props = {
  profile: Profile;
  socket: Socket | undefined;
  isOwner: boolean;
};

export default function SectionAchievements({ profile, socket, isOwner }: Props) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setstats] = useState<ShortStats | undefined>(undefined);
  const achievementService = new AchievementService();
  const router = useRouter();

  const getUserAchievements = async () => {
    try {
      const res = await achievementService.getAllAchievement(profile.id);

      if (!res.success) throw new Error("cannot get achievements");

      const data: FullAchivement = res.data;

      let newAchievements = data.achievement
        .map((achievement) => {
          if (
            profile.provider === "42" &&
            (achievement.code === "VERIFY_EMAIL" ||
              achievement.code === "LOGIN_GOOGLE")
          )
            return null;
          if (
            profile.provider === "google" &&
            (achievement.code === "VERIFY_EMAIL" ||
              achievement.code === "LOGIN_42")
          )
            return null;
          if (
            profile.provider === "email" &&
            (achievement.code === "LOGIN_42" ||
              achievement.code === "LOGIN_GOOGLE")
          )
            return null;
          return achievement;
        })
        .filter((achievement) => achievement !== null) as UserAchievement[];

      setAchievements(newAchievements);
      setstats(data.stats);
    } catch (error: any) {
      if (error.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
      toast.error("Something went wrong, please refresh the page!");
    }
  };

  useEffect(() => {
    getUserAchievements();

    const updateNotif = (payload: { why: string }) => {
      if (payload && payload.why && payload.why === "updateAchievements")
        getUserAchievements();
    };

    socket?.on('achievement', getUserAchievements);
    socket?.on('notif', updateNotif);

    return () => {
      socket?.off('achievement', getUserAchievements);
      socket?.off('notif', updateNotif);
    }
  }, [socket]);

  const collectXP = async (achievement: UserAchievement) => {
    if (achievement.collected || !achievement.completed) return;

    // you can collect xp only if it's your achievement
    // cannot click on achievements on the other pongies profiles
    if (!isOwner)
      return ;

    try {
      await achievementService.collectAchievement(
        profile.id,
        achievement.id.toString()
      );
      toast.info(`${achievement.xp}xp collected!`);
      socket?.emit("notif", {
        why: "updateAchievements",
      });
    } catch (error: any) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error);
      if (error.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
      toast.error("Something went wrong, please try again!");
    }
  };

  const list = achievements.map((achievement) => {
    return (
      <div
        className={styles.gridItem}
        key={achievement.id}
        style={{
          opacity: achievement.completed ? 1 : 0.4,
          boxShadow:
            achievement.completed && !achievement.collected && isOwner
              ? "0px 0px 40px var(--achievement)"
              : undefined,
          cursor:
            achievement.completed && !achievement.collected && isOwner
              ? "pointer"
              : "default",
          borderColor:
            achievement.completed && !achievement.collected && isOwner
              ? "var(--achievement)"
              : "var(--tertiary3)",
        }}
        onClick={() => collectXP(achievement)}
      >
        <AchievementItem achievement={achievement} stats={stats} isOwner={isOwner} />
      </div>
    );
  });

  return (
    <div className={styles.main}>
      {/* Header */}
      <HeaderAchievement achievements={achievements} />

      {/* Separator */}
      <div className={styles.line}></div>

      {/* achievements list */}
      <div className={styles.grid}>{list}</div>
    </div>
  );
}
