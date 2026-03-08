import { NavLink } from "react-router-dom";
import { House, Calendar, Headphones, BookOpen, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: House, label: { en: "Home", ru: "Главная" } },
  { to: "/schedule", icon: Calendar, label: { en: "Schedule", ru: "Расписание" } },
  { to: "/meditations", icon: Headphones, label: { en: "Meditate", ru: "Медитации" } },
  { to: "/guide", icon: BookOpen, label: { en: "Guide", ru: "Гайд" } },
  { to: "/about", icon: Info, label: { en: "About", ru: "О нас" } },
];

export function BottomNav() {
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label[language]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
