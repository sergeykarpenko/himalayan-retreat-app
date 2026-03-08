import { useState } from "react";
import {
  Sun,
  Moon,
  Utensils,
  Brain,
  MessageCircle,
  Mountain,
  Heart,
  Users,
  Sparkles,
  DoorOpen,
  Flame,
  User,
  Leaf,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { schedule } from "@/data/schedule";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  sun: Sun,
  moon: Moon,
  utensils: Utensils,
  brain: Brain,
  "message-circle": MessageCircle,
  mountain: Mountain,
  heart: Heart,
  users: Users,
  sparkles: Sparkles,
  "door-open": DoorOpen,
  flame: Flame,
  user: User,
  leaf: Leaf,
};

export function SchedulePage() {
  const { t, language } = useLanguage();
  const [activeDay, setActiveDay] = useState(0);
  const day = schedule[activeDay];

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-4">
          {t("Schedule", "Расписание")}
        </h2>

        <div className="flex gap-2 mb-6">
          {schedule.map((d, i) => (
            <button
              key={d.tab.en}
              onClick={() => setActiveDay(i)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-xs font-medium transition-colors",
                activeDay === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {d.tab[language]}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {day.title[language]}
        </p>
      </div>

      <div className="px-4 pb-8">
        <div className="space-y-1">
          {day.items.map((item, i) => {
            const Icon = iconMap[item.icon] || Leaf;
            return (
              <div
                key={i}
                className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-card"
              >
                <div className="flex flex-col items-center pt-0.5">
                  <span className="text-xs font-mono text-muted-foreground w-12 text-center">
                    {item.time}
                  </span>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {item.title[language]}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description[language]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
