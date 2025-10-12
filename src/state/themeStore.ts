// Theme store for dark mode support

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    metal: string;
    crystal: string;
    deuterium: string;
    energy: string;
    border: string;
    inputBackground: string;
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: "#f5f5f7",
    card: "#ffffff",
    text: "#000000",
    textSecondary: "#6e6e73",
    primary: "#007AFF",
    secondary: "#5856D6",
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",
    metal: "#8B7355",
    crystal: "#4A90E2",
    deuterium: "#50C878",
    energy: "#FFD700",
    border: "#d1d1d6",
    inputBackground: "#f2f2f7",
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989d",
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    success: "#30D158",
    warning: "#FF9F0A",
    danger: "#FF453A",
    metal: "#A0826D",
    crystal: "#64B5F6",
    deuterium: "#66BB6A",
    energy: "#FFD54F",
    border: "#38383a",
    inputBackground: "#2c2c2e",
  },
};

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: darkTheme, // Default to dark mode
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        set({ theme: currentTheme.dark ? lightTheme : darkTheme });
      },
      
      setDarkMode: (enabled: boolean) => {
        set({ theme: enabled ? darkTheme : lightTheme });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useThemeStore;
