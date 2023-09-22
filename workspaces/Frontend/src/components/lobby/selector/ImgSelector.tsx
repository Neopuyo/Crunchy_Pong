import React from "react";
import styles from "@/styles/lobby/selector/ImgSelector.module.css";
import Image from "next/image";

type Props = {
  type: "background" | "ball";
  value: string;
  setValue: Function;
  imgs: string[];
  width: number;
  height: number;
  disabled?: boolean;
};

export default function ImgSelector({
  type,
  value,
  setValue,
  imgs,
  width,
  height,
  disabled = false,
}: Props) {
  const handleChange = (
    event: React.MouseEvent<HTMLButtonElement>,
    img: string
  ) => {
    event?.preventDefault();
    if (!disabled) {
      setValue(img);
    }
  };

  return (
    <div className={styles.imgList}>
      {imgs.map((img: string, index: number) => {
        const isActive = value === img;
        const isDisabled = disabled;

        let buttonClass = styles.inactiveButton;
        if (isActive) {
          buttonClass = styles.activeButton;
        } else if (isDisabled && img !== "classic") {
          buttonClass = `${styles.disabled} ${styles.blur}`;
        }

        return (
          <button
            className={buttonClass}
            key={index}
            onClick={(event) => handleChange(event, img)}
            disabled={disabled}
          >
            <Image
              src={`/images/${type}/${img}.png`}
              alt={img}
              width={width}
              height={height}
            />
          </button>
        );
      })}
    </div>
  );
}
