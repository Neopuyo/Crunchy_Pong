import styles from "@/styles/navbar/Navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import { PONG_SENTENCE } from "@transcendence/shared/constants/Sentence.constants";
import { useEffect, useState } from "react";

type Props = {
  link: string;
};

export default function NavbarLogo({ link }: Props) {
  const [catchphrase, setCatchphrase] = useState<string>("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * PONG_SENTENCE.length);
    setCatchphrase(PONG_SENTENCE[randomIndex]);
  }, []);

  return (
    <Link href={link}>
      <div className={styles.left}>
        <Image
          src="/images/icon.png"
          alt="Logo Crunchy Pong"
          width={50}
          height={50}
          title="Logo Crunchy Pong"
          className={styles.logo}
        />
        <div className={styles.name}>
          <h2 className={styles.title}>Crunchy Pong</h2>
          <h4 className={styles.catchphrase}>{catchphrase}</h4>
        </div>
      </div>
    </Link>
  );
}
