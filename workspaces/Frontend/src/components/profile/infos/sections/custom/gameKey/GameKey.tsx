import React, { useState } from "react";
import Profile_Service from "@/services/Profile.service";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

import stylesInfo from "@/styles/profile/InfoCard.module.css";
import styles from "@/styles/profile/GameKey.module.css";

type Props = {
  profile: Profile;
};

export default function GameKey({ profile }: Props) {
  const profileService = new Profile_Service();
  const [gameKey, setGameKey] = useState<"Arrow" | "ZQSD" | "WASD">(
    profile.gameKey
  );
  const [prof, setProf] = useState<Profile>(profile);
  const router = useRouter();

  const changeKey = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;

    if (
      selectedValue === "Arrow" ||
      selectedValue === "ZQSD" ||
      selectedValue === "WASD"
    ) {
      setGameKey(selectedValue);
      const rep: Rep = await profileService.editUser({
        gameKey: selectedValue,
      });
      if (rep.success) {
        const updatedProfile = profile;
        updatedProfile.gameKey = selectedValue;
        setProf(updatedProfile);
      } else {
        if (rep.message === "disconnect") {
          await disconnect();
          router.refresh();
          return;
        }
      }
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(rep);
    }

    // Update the database
  };

  return (
    <div className={styles.gameKey}>
      <p className={stylesInfo.tinyTitle}>Game Paddle Key</p>
      <select value={gameKey} onChange={changeKey} className={styles.dropdown}>
        <option value="Arrow">Up: ↑ Down: ↓</option>
        <option value="ZQSD">Up: Z Down: S</option>
        <option value="WASD">Up: W Down: S</option>
      </select>
    </div>
  );
}
