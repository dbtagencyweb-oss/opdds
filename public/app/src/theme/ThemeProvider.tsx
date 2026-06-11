import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextValue = {
  darkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('opd_dark_mode');
      return v === null ? true : v === 'true';
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('opd_dark_mode', String(darkMode));
    } catch (e) {}
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkModeState((d) => !d);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setDarkMode: setDarkModeState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
