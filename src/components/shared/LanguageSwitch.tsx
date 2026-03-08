import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border p-0.5 text-xs">
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ru")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          language === "ru"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        RU
      </button>
    </div>
  );
}
