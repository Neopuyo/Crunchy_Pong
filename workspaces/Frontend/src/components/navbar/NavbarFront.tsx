"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import styles from "@/styles/navbar/Navbar.module.css";
import Theme from "../theme/Theme";
import NavbarLogo from "./NavbarLogo";
import NavbarLogInBtn from "./NavbarLogInBtn";
import NavbarLogOutBtn from "./NavbarLogOutBtn";
import NavbarConnected from "./NavbarConnected";

type Props = {
  avatar: Avatar | undefined;
  profile: Profile | undefined;
  token: string | undefined;
};

export default function NavbarFront({ avatar, profile, token }: Props) {
  const segment = useSelectedLayoutSegment();
  const pathName = usePathname();

  if (segment === "welcome") {
    return (
      <header>
        <nav className={styles.nav}>
          <NavbarLogo link="/welcome" />
          <div className={styles.right}>
            <Theme />
            <NavbarLogInBtn />
          </div>
        </nav>
        <div className={styles.barBottom}></div>
      </header>
    );
  }

  if (pathName === "/home/auth/2fa" && profile) {
    return (
      <header>
        <nav className={styles.nav}>
          <NavbarLogo link="/welcome" />
          <div className={styles.right}>
            <Theme />
            <NavbarLogOutBtn profile={profile} />
          </div>
        </nav>
        <div className={styles.barBottom}></div>
      </header>
    );
  }

  if (
    !token ||
    !profile ||
    !profile.login ||
    !avatar ||
    pathName === "/home/auth/connect"
  )
    return (
      <header>
        <nav className={styles.nav}>
          <NavbarLogo link="/home" />
          <div className={styles.rightAlone}>
            <Theme />
          </div>
        </nav>
        <div className={styles.barBottom}></div>
      </header>
    );

  return <NavbarConnected avatar={avatar} token={token} profile={profile} />;
}
