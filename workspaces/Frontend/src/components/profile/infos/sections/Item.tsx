import { ReactNode } from "react";
import styles from "@/styles/profile/InfoCard.module.css";

type Props = {
  title: string;
  children: ReactNode;
};

export default function Item({ title, children }: Props) {
  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
