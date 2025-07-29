"use client";

import { useTheme } from "@/context/theme-provider";
import { Icon } from "../UI/icons/Icon";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="cursor-pointer" onClick={toggleTheme}>
      <Icon name="Swatch" size="md" />
    </div>
  );
}
