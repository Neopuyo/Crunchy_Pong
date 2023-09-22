"use client";
import { MdHistory, MdGames, MdLeaderboard } from "react-icons/md";
import styles from "@/styles/lobby/NavLobby.module.css";

type Props = {
  menu: string;
  setMenu: Function;
};

export default function NavLobby({ menu, setMenu }: Props) {
  // -------------------------------------  RENDU  ------------------------------------ //

  //Si le joueur n'est pas en game
  return (
    <nav className={styles.menu}>
      <button
        className={`${
          menu === "League" ? styles.activeBtn : styles.inactiveBtn
        }`}
        onClick={() => setMenu("League")}
      >
        <MdLeaderboard size={40} />
        <h2>League</h2>
      </button>
      <button
        className={`${
          menu === "Party" ? styles.activeBtn : styles.inactiveBtn
        }`}
        onClick={() => setMenu("Party")}
      >
        <MdGames size={40} />
        <h2>Party</h2>
      </button>
      <button
        className={`${
          menu === "Training" ? styles.activeBtn : styles.inactiveBtn
        }`}
        onClick={() => setMenu("Training")}
      >
        <MdHistory size={40} />
        <h2>Training</h2>
      </button>
    </nav>
  );
}
