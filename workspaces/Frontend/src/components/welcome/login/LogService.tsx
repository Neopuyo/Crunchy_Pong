import Image from "next/image";
import styles from "@/styles/welcome/login/LogService.module.css";
import { toast } from "react-toastify";

type Props = {
  setTextButton: Function;
};

export default function LogInComponent({ setTextButton }: Props) {

  // -------------------------------------  FONCTIONS  ------------------------------------ //
  const open42 = async () => {
    setTextButton("Loading...");
    try {
      const res = await fetch(`http://${process.env.HOST_IP}:4000/api/auth/healthCheck`);

      if (!res.ok || res.status !== 200)
        throw new Error('fetch failed');

      window.open(process.env.URL_42, "_self");
    }
    catch (error) {
      toast.error("Something went wrong, please try again!");
      setTextButton("Continue");
    }
  };

  const openGoogle = async () => {
    setTextButton("Loading...");
    try {
      const res = await fetch(`http://${process.env.HOST_IP}:4000/api/auth/healthCheck`);

      if (!res.ok || res.status !== 200)
        throw new Error('fetch failed');

      window.open(`http://${process.env.HOST_IP}:4000/api/auth/google`, "_self");
    }
    catch (error) {
      toast.error("Something went wrong, please try again!");
      setTextButton("Continue");
    }
  };

  // -------------------------------------  RENDU  ------------------------------------ //
  return (
    <div className={styles.logService}>
      <p className={styles.description}>Connect or register in one click</p>
      <div className={styles.logImg}>
        <div className={styles.oneClick} style={{paddingRight: "4px"}}>
          <Image
            alt="42 school logo"
            src="/images/auth/42_Logo.png"
            onClick={open42}
            fill
            style={{
              objectFit: "cover",
            }}
            sizes="100%"
            className={styles.school}
          />
        </div>
        {
          process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev" &&
          <div className={styles.oneClick}>
            <Image
              alt="google logo"
              src="/images/auth/google.png"
              fill
              style={{
                objectFit: "cover",
              }}
              sizes="100%"
              onClick={openGoogle}
              className={styles.google}
            />
          </div>
        }
      </div>
    </div>
  );
}
