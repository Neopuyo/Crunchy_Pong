import { IconProp } from "@fortawesome/fontawesome-svg-core";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  faFaceSmileWink,
  faGear,
  faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/profile/InfoCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  activeButton: number;
  setActiveButton: Dispatch<SetStateAction<number>>;
  myRelation: UserRelation;
};

type ButtonData = {
  id: number;
  name: string;
  icon: IconProp;
};

export default function NavbarChannelInfo({
  activeButton,
  setActiveButton,
  myRelation,
}: Props) {
  const [selectedItem, setSelectedItem] = useState(0);

  const handleClick = (buttonId: number) => {
    setActiveButton(buttonId);
    setSelectedItem(buttonId);
  };

  const buttonData: ButtonData[] = myRelation.isBoss
    ? [
		{ id: 0, name: "Pongers", icon: faFaceSmileWink },
        { id: 1, name: "Channel", icon: faSquarePollHorizontal },
        { id: 2, name: "Custom", icon: faGear },
      ]
    : [
        { id: 0, name: "Pongers", icon: faFaceSmileWink },
        { id: 1, name: "Channel", icon: faSquarePollHorizontal },
      ];

  return (
    <div className={styles.navbar}>
      {buttonData.map((button) => (
        <div
          key={button.id}
          className={`${styles.button} ${
            button.id === selectedItem ? styles.active : ""
          }`}
          onClick={() => handleClick(button.id)}
        >
          <FontAwesomeIcon icon={button.icon} />
          <div>&#8239;{button.name}</div>
        </div>
      ))}
    </div>
  );
}
