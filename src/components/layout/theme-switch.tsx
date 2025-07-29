"use client";

import { useTheme } from "@/context/theme-provider";
import { Button } from "@/components/UI/button";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => setTheme("light")}
        variant={theme === "light" ? "default" : "outline"}
      >
        Light
      </Button>
      <Button
        onClick={() => setTheme("dark")}
        variant={theme === "dark" ? "default" : "outline"}
      >
        Dark
      </Button>
      <Button
        onClick={() => setTheme("custom")}
        variant={theme === "custom" ? "default" : "outline"}
      >
        Custom
      </Button>
    </div>
  );
}
