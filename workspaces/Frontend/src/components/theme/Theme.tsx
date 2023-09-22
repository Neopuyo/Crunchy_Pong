"use client";
import styles from "@/styles/theme/Theme.module.css";
import { MdWbSunny, MdNightsStay } from "react-icons/md";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

const Theme = () => {
  const [theme, setTheme] = useState<string>("light");

  const handleMode = () => {
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (prefersDarkMode) {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      document.documentElement.setAttribute("color-scheme", newTheme);
      localStorage.setItem("theme", newTheme);
    } else {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      document.documentElement.setAttribute("color-scheme", newTheme);
      localStorage.setItem("theme", newTheme);
    }
    const themeButton = document.querySelector(
      ".theme-btn"
    ) as HTMLButtonElement;
    if (themeButton) {
      themeButton.blur(); // Remove focus from the button
    }
  };

  useEffect(() => {
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setTheme(newTheme);
      document.documentElement.setAttribute("color-scheme", newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("color-scheme", theme);
  }, [theme]);

  return (
    <div className={styles.theme}>
      <button
        title="theme button"
        type="button"
        className={styles.themeBtn}
        onClick={handleMode}
      >
        {theme === "light" ? <MdWbSunny className={styles.icon} /> : <MdNightsStay className={styles.icon} />}
      </button>
      <ToastContainer
        autoClose={2000}
        newestOnTop={true}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        limit={2}
        theme={theme === "light" ? "light" : "dark"}
      />
    </div>
  );
};

export default Theme;
