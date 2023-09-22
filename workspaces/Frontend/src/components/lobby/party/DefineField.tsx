"use client";

import React, { useEffect } from "react";
import styles from "@/styles/lobby/party/DefineField.module.css";
import ImgSelector from "@/components/lobby/selector/ImgSelector";
import {
  BACKGROUND,
  BALL,
} from "@transcendence/shared/constants/Asset.constants";

type Props = {
  background: string;
  setBackground: Function;
  ball: string;
  setBall: Function;
  selected: "Classic" | "Best3" | "Best5" | "Random" | "Custom";
};

export default function DefineField({
  background,
  setBackground,
  ball,
  setBall,
  selected,
}: Props) {
  // ----------------------------------  CHARGEMENT  ---------------------------------- //

  // reset settings
  useEffect(() => {
    setBackground("Classic");
    setBall("Classic");
  }, [setBackground, setBall]);

  return (
    <div className={styles.fieldSelector}>
      {/* Background */}
      <h3 className={styles.section}>Party Field</h3>
      <ImgSelector
        type={"background"}
        value={background}
        setValue={setBackground}
        imgs={BACKGROUND}
        width={135}
        height={80}
        disabled={selected === "Classic" || selected === "Random"}
      />

      {/* Ball */}
      <h3 className={styles.section}>Party Ball</h3>
      <ImgSelector
        type={"ball"}
        value={ball}
        setValue={setBall}
        imgs={BALL}
        width={30}
        height={30}
        disabled={selected === "Classic" || selected === "Random"}
      />
    </div>
  );
}
