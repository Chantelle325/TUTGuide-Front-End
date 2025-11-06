import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme(); // 🌙 or ☀️ automatically detected
  const [darkMode, setDarkModeState] = useState(false);

  // Load saved theme OR default to system theme
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("darkMode");
      if (saved !== null) {
        setDarkModeState(saved === "true");
      } else {
        // Default to system preference if nothing saved
        setDarkModeState(systemTheme === "dark");
      }
    };
    loadTheme();
  }, [systemTheme]);

  const setDarkMode = async (value: boolean) => {
    setDarkModeState(value);
    await AsyncStorage.setItem("darkMode", value.toString());
  };

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkModeState(newValue);
    await AsyncStorage.setItem("darkMode", newValue.toString());
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
