"use client";

import disconnect from "@/lib/disconnect/disconnect";
import styles from "@/styles/error/ErrorsMerged.module.css";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function ServerError() {

  const router = useRouter();

  const signoff = async () => {
    await disconnect();
    router.replace("/welcome/login");
    return ;
  }

  return (
    <div className={styles.errorPage}>
      <div className={styles.errorFrame}>
        <div className={styles.error}>
          <FontAwesomeIcon icon={faQuestionCircle} className={styles.icon} />
          <h2 className={styles.errorTitle}>Sorry, an error has occured...</h2>
          <div className={styles.errorLink} onClick={signoff}>
            <h3 className={styles.errorReturn}>Return to login page</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
