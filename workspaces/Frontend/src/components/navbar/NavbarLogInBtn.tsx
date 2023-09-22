import styles from "@/styles/navbar/Navbar.module.css";
import Link from "next/link";

export default function NavbarLogInBtn() {
  return (
    <Link href="/welcome/login" className={styles.logIn}>
      <button type="button" title="Log Button" className={styles.logInBtn}>
        Log In
      </button>
    </Link>
  );
}
