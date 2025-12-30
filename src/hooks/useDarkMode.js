// src/hooks/useDarkMode.js
import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

export default function useDarkMode() {
  // Check user's system preference
  const getSystemPreference = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  // Use localStorage to persist dark mode preference
  const { value: storedDarkMode, setValue: setStoredDarkMode } = useLocalStorage(
    "darkMode",
    getSystemPreference()
  );

  const [darkMode, setDarkMode] = useState(storedDarkMode);

  // Apply dark mode to document
  const applyDarkMode = useCallback((isDark) => {
    if (typeof document === "undefined") return;
    
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (isDark) {
      htmlElement.setAttribute("data-bs-theme", "dark");
      htmlElement.classList.add("dark-mode");
      bodyElement.classList.add("dark-mode");
    } else {
      htmlElement.setAttribute("data-bs-theme", "light");
      htmlElement.classList.remove("dark-mode");
      bodyElement.classList.remove("dark-mode");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setStoredDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
  }, [darkMode, setStoredDarkMode, applyDarkMode]);

  // Initialize dark mode on mount
  useEffect(() => {
    applyDarkMode(darkMode);
  }, [darkMode, applyDarkMode]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (storedDarkMode === null) {
        const newDarkMode = e.matches;
        setDarkMode(newDarkMode);
        applyDarkMode(newDarkMode);
      }
    };
    
    // Add event listener
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [storedDarkMode, applyDarkMode]);

  // Get dark mode class for components
  const getDarkModeClass = useCallback((lightClass = "", darkClass = "") => {
    return darkMode ? darkClass : lightClass;
  }, [darkMode]);

  // Get dark mode styles
  const getDarkModeStyles = useCallback((lightStyles = {}, darkStyles = {}) => {
    return darkMode ? darkStyles : lightStyles;
  }, [darkMode]);

  // Check if dark mode is enabled
  const isDarkMode = darkMode;

  return {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    getDarkModeClass,
    getDarkModeStyles,
    isDarkMode
  };
}