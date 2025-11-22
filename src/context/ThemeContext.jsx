// src/context/ThemeContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("mediflow_theme") || "light";
    } catch {
      return "light";
    }
  });

  // Apply theme to <html> root
  useEffect(() => {
    const root = document.documentElement;

    // Reset both classes to avoid conflict
    root.classList.remove("light", "dark");

    // Apply new theme
    root.classList.add(theme);

    // Save preference
    localStorage.setItem("mediflow_theme", theme);
  }, [theme]);

  const toggle = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
