"use client";
import styles from "@/styles/scrollBtn/ScrollBtn.module.css";
import { useEffect, useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";

export default function ScrollBtn() {
  const [showBtn, setShowBtn] = useState<boolean>(false);

  useEffect(() => {
    const handleScrollBtn = () => {
      if (window.scrollY > 50) {
        setShowBtn(true);
      } else {
        setShowBtn(false);
      }
    };

    window.addEventListener("scroll", handleScrollBtn);

    return () => {
      window.removeEventListener("scroll", handleScrollBtn);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.scroll}>
      {showBtn && (
        <button className={styles.scrollBtn} onClick={handleScrollToTop}>
          <MdKeyboardArrowUp />
        </button>
      )}
    </div>
  );
}
