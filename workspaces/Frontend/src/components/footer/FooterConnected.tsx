import disconnect from "@/lib/disconnect/disconnect";
import styles from "@/styles/footer/footer.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FooterConnected({ profile }: { profile: Profile }) {

	const	router = useRouter();

	const signoff = async () => {
		await disconnect();
		router.replace("/welcome/login");
		return ;
	}

  return (
    <footer className={styles.footer}>
      <div className={styles.line}></div>

      <div className={styles.horizontal}>
        <div className={styles.title}>
          <h5 className={styles.copyright}>&copy;Crunchy Pong 2023</h5>
          <p>Let&apos;s play together</p>
        </div>

        <div className={styles.ref}>
          <Link href={"/home"} className={styles.link}>
            Home Page
          </Link>
          <Link href={`/home/profile/${profile.id}`} className={styles.link}>
            Profile
          </Link>
          <Link href={"/home/chat"} className={styles.link}>
            Chat
          </Link>
          <div className={styles.link} onClick={signoff}>
            Log Out
          </div>
        </div>
      </div>
    </footer>
  );
}
