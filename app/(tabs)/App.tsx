import { Slot } from "expo-router";
import { ThemeProvider } from "../ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
