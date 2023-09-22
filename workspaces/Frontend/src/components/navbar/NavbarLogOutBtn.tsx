import disconnect from "@/lib/disconnect/disconnect";
import styles from "@/styles/navbar/Navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavbarLogOutBtn({ profile }: { profile: Profile }) {
  const router = useRouter();

  const signoff = async () => {
      await disconnect(profile.id.toString());
      router.refresh();
  };

  return (
    <Link href="/welcome" className={styles.logIn}>
      <button
        type="button"
        title="Log out Button"
        className={styles.logInBtn}
        onClick={signoff}
      >
        Log Out
      </button>
    </Link>
  );
}
