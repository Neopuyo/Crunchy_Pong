"use client";

import styles from "@/styles/lobby/party/DefineName.module.css";
import { MdRefresh } from "react-icons/md";

import {
  uniqueNamesGenerator,
  starWars,
  names,
  animals,
  countries,
  Config,
} from "unique-names-generator";

type Props = {
  name: string;
  setName: Function;
  enterName: boolean;
  setEnterName: Function;
};

export default function DefineName({
  name,
  setName,
  enterName,
  setEnterName,
}: Props) {
  const config: Config = {
    dictionaries: [starWars, names, animals, countries],
    length: 1,
    separator: "-",
    style: "capital",
  };
  // ------------------------------------  CREATE  ------------------------------------ //
  function generateRandomName() {
    const randomName = uniqueNamesGenerator(config);
    setName(randomName);
  }
  // -------------------------------------  RENDU  ------------------------------------ //
  return (
    <div className={styles.name}>
      <h3 className={styles.section}>Party Name</h3>
      <div className={styles.nameContainer}>
        <input
          className={enterName ? styles.nameInputError : styles.nameInput}
          type="text"
          placeholder={enterName ? "Please enter a name" : ""}
          id="name"
          name="name"
          value={name}
          maxLength={20}
          onChange={(event) => {
            setName(event.target.value);
            setEnterName(false);
          }}
        />
        <button
          className={styles.randomBtn}
          onClick={() => generateRandomName()}
        >
          <MdRefresh />
        </button>
      </div>
    </div>
  );
}
