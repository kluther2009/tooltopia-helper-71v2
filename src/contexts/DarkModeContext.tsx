import React, { createContext, useContext, useEffect } from "react";

interface DarkModeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Provide dummy setDarkMode function since we're not using it anymore
  const handleDarkModeChange = () => {};

  return (
    <DarkModeContext.Provider value={{ darkMode: true, setDarkMode: handleDarkModeChange }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}