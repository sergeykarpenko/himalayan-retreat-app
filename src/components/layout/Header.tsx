import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-medium tracking-widest uppercase">
          Retreat
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === "en" ? "ru" : "en")}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
          >
            {language === "en" ? "RU" : "EN"}
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
