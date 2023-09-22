import styles from "@/styles/profile/InfoCard.module.css";
import { useState } from "react";

type Props = {
  profile: Profile;
};

export default function MottoDisplayOnly({ profile }: Props) {
  const [motto, setMotto] = useState<string>(
    profile.motto === null ? "" : profile.motto
  );

  return (
    <>
      {motto !== "" && <p className={styles.tinyTitle}>Crunchy motto</p>}
      {motto !== "" && <p className={styles.motto}> {motto} </p>}
    </>
  );
}
