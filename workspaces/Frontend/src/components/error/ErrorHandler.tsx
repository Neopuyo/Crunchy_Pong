"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/error/ErrorsMerged.module.css";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LobbyService from "@/services/Lobby.service";
import disconnect from "@/lib/disconnect/disconnect";

type Props = {
  errorTitle?: string;
  errorNotif?: string;
  returnLink?: string;
  returnLinkName?: string;
  refresh?: boolean;
  inGame?: boolean;
};

export default function ErrorHandler({
  errorTitle,
  errorNotif,
  returnLink,
  returnLinkName,
  refresh,
  inGame,
}: Props) {
  const router = useRouter();
  const title = errorTitle ? errorTitle : "Oops, something went wrong";
  const notif =
    errorNotif &&
    process.env &&
    process.env.ENVIRONNEMENT &&
    process.env.ENVIRONNEMENT === "dev"
      ? errorNotif
      : "Please try again later";
  const linkName = returnLinkName ? returnLinkName : "return to home page";
  const lobby = new LobbyService();

  const returnHome = async () => {
    if (inGame && refresh) {
      router.back();
    } else if (inGame && !refresh) {
      try {
        await lobby.quitGame();
        router.push("/home?home");
      } catch (error: any) {
        if (
          process.env &&
          process.env.ENVIRONNEMENT &&
          process.env.ENVIRONNEMENT === "dev"
        )
          console.log(error);
        await disconnect();
        router.refresh();
      }
    } else {
      router.push("/home?home");
    }
  };

  return (
    <main className={styles.errorPage}>
      <div className={styles.errorFrame}>
        <div className={styles.error}>
          <FontAwesomeIcon icon={faQuestionCircle} className={styles.icon} />
          <h2 className={styles.errorTitle}>{title}</h2>
          <p className={styles.errorNotif}>{notif}</p>
          <div className={styles.errorLink} onClick={returnHome}>
            <h3 className={styles.errorReturn}>{linkName}</h3>
          </div>
        </div>
      </div>
    </main>
  );
}
