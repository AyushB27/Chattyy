import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const themes = [
  { id: "dark", name: "Cyber Dark", icon: "🌙", color: "#6366f1" },
  { id: "midnight", name: "OLED Midnight", icon: "🖤", color: "#10b981" },
  { id: "sunset", name: "Sunset Velvet", icon: "🔮", color: "#d946ef" },
  { id: "light", name: "Clean Snow", icon: "☀️", color: "#4f46e5" },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("chatty_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("chatty_theme", theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (themes.some((t) => t.id === newTheme)) {
      setThemeState(newTheme);
    }
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
