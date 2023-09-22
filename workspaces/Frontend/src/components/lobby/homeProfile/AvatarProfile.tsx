"use client";

import styles from "@/styles/lobby/homeProfile/AvatarProfile.module.css";
import Link from "next/link";
import AvatarUser from "../../avatarUser/AvatarUser";
import { CSSProperties } from "react";

type Props = {
  profile: Profile;
  avatar: Avatar;
};

export default function AvatarProfile({ profile, avatar }: Props) {
  const colorAddedStyle: CSSProperties = {
    background: `linear-gradient(to bottom, ${avatar.borderColor.toString()} 45%, var(--primary1) 45%)`,
  };

  return (
    <div className={styles.avatarProfile} style={colorAddedStyle}>
      <Link className={styles.links} href={`/home/profile/${profile.id}`}>
        <div className={styles.avatar}>
          <AvatarUser
            avatar={avatar}
            borderSize={"6px"}
            backgroundColor={avatar.backgroundColor}
            borderColor={avatar.borderColor}
            fontSize="3rem"
          />
        </div>
        <h2 className={styles.login}>{profile.login}</h2>
      </Link>
    </div>
  );
}
