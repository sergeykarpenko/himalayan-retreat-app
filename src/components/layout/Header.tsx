import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Send } from "lucide-react";
import { TelegramLoginButton } from "@/components/shared/TelegramLoginButton";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-medium tracking-widest uppercase">
          Retreat
        </h1>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                  {user.first_name[0]}
                </div>
              )}
              <span className="text-xs font-medium max-w-[80px] truncate">
                {user.first_name}
              </span>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <TelegramLoginButton size="icon" />
          )}
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
