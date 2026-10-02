"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ThemeToggle = ({ className }) => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // The inline script in the root layout has already applied the theme class
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    try {
      localStorage.setItem("theme", newTheme);
    } catch {}
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("h-8 w-8 rounded-full text-muted-foreground hover:text-foreground", className)}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Moon /> : <Sun />}
    </Button>
  );
};

export const FloatingThemeToggle = () => (
  <div className="fixed top-3 right-3 z-50 rounded-full bg-card/80 backdrop-blur border border-border shadow-sm">
    <ThemeToggle />
  </div>
);

export default ThemeToggle;
