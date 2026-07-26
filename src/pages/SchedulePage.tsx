import { useState } from "react";
import {
  DoorOpen,
  MapPin,
  Leaf,
  Sparkles,
  Mountain,
  Sun,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { schedule } from "@/data/schedule";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  "door-open": DoorOpen,
  "map-pin": MapPin,
  leaf: Leaf,
  sparkles: Sparkles,
  mountain: Mountain,
  sun: Sun,
};

export function SchedulePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [openDay, setOpenDay] = useState<number | null>(0);

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-2">
          {t("Schedule", "Расписание")}
        </h2>

        {!user && (
          <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5 mb-2">
            <Lock className="h-3 w-3" />
            {t(
              "Sign in to see the full schedule",
              "Войдите, чтобы увидеть полное расписание"
            )}
          </p>
        )}
      </div>

      <div className="px-4 pb-8 space-y-2">
        {schedule.map((day, i) => {
          const Icon = iconMap[day.icon] || Sparkles;
          const locked = i > 0 && !user;
          const isOpen = !locked && openDay === i;

          return (
            <div
              key={day.date.en}
              className={cn(
                "rounded-2xl border border-border bg-card/55 backdrop-blur-md overflow-hidden",
                locked && "opacity-50"
              )}
            >
              <button
                onClick={() =>
                  locked ? undefined : setOpenDay(isOpen ? null : i)
                }
                disabled={locked}
                className={cn(
                  "flex w-full items-center gap-3 p-4 text-left",
                  locked && "cursor-not-allowed"
                )}
              >
                {locked ? (
                  <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                )}
                <div className="flex-1">
                  <span className="block text-xs font-mono text-muted-foreground">
                    {day.date[language]}
                  </span>
                  <span className="text-sm font-medium">
                    {day.title[language]}
                  </span>
                </div>
                {locked ? (
                  <span className="text-xs text-muted-foreground">
                    {t("Sign in", "Войдите")}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-muted-foreground transition-transform text-xs",
                      isOpen && "rotate-180"
                    )}
                  >
                    &#9662;
                  </span>
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {day.description[language]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
