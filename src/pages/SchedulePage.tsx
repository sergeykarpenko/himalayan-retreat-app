import { useEffect, useState } from "react";
import {
  DoorOpen,
  MapPin,
  Leaf,
  Sparkles,
  Mountain,
  Sun,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTelegramLogin } from "@/hooks/useTelegramLogin";
import { useRetreat } from "@/hooks/useRetreat";
import { retreatDates } from "@/data/schedule";
import { cn } from "@/lib/utils";

interface DaySchedule {
  date: { en: string; ru: string };
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  "door-open": DoorOpen,
  "map-pin": MapPin,
  leaf: Leaf,
  sparkles: Sparkles,
  mountain: Mountain,
  sun: Sun,
};

export function SchedulePage() {
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { loginUrl, onLinkClick } = useTelegramLogin();
  const retreatState = useRetreat();
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  /**
   * Распорядок ниже принадлежит КОНКРЕТНОМУ потоку (src/data/schedule.ts), а
   * не «ближайшему ретриту»: дни подписаны его датами («Sep 23»). Страница
   * поэтому называет владельца распорядка, а когда с сайта известно, что
   * предстоящий поток другой (programmeMatches === false) — говорит и это.
   * Молчать нельзя: подписанные днями даты читаются как расписание
   * предстоящего ретрита, а у октябрьского ceremonial-потока и длительность,
   * и состав другие.
   */
  const other =
    retreatState.status === "ready" && !retreatState.retreat.programmeMatches
      ? retreatState.retreat
      : null;
  const otherNote = !other
    ? null
    : other.dates[language].trim()
      ? t(
          `The upcoming retreat (${other.dates.en}) follows a different programme.`,
          `У предстоящего потока (${other.dates.ru}) программа другая.`,
        )
      : t(
          "The upcoming retreat follows a different programme.",
          "У предстоящего потока программа другая.",
        );

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    fetch("/api/schedule", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("schedule_unavailable");
        return response.json() as Promise<{ days?: DaySchedule[] }>;
      })
      .then((payload) => setSchedule(payload.days ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setSchedule([]);
      });
    return () => controller.abort();
  }, [authLoading, user?.id]);

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-2">
          {t("Schedule", "Расписание")}
        </h2>

        <p className="text-xs text-muted-foreground/80 leading-relaxed mb-2">
          {t(
            `Programme of the ${retreatDates.en} retreat.`,
            `Распорядок потока ${retreatDates.ru}.`,
          )}
          {otherNote && ` ${otherNote}`}
        </p>

        {!user && (
          <a
            href={loginUrl}
            onClick={onLinkClick}
            className="text-xs text-muted-foreground/60 flex items-center gap-1.5 mb-2 hover:text-foreground transition-colors w-fit"
          >
            <Lock className="h-3 w-3" />
            {t(
              "Sign in to see the full schedule",
              "Войдите, чтобы увидеть полное расписание"
            )}
          </a>
        )}
      </div>

      <div className="px-4 pb-8 space-y-2">
        {schedule.map((day, i) => {
          const Icon = iconMap[day.icon] || Sparkles;
          const isOpen = openDay === i;

          return (
            <div
              key={day.date.en}
              className={cn(
                "rounded-2xl border border-border bg-card/55 backdrop-blur-md overflow-hidden",
              )}
            >
                <button
                  onClick={() => setOpenDay(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1">
                    <span className="block text-xs font-mono text-muted-foreground">
                      {day.date[language]}
                    </span>
                    <span className="text-sm font-medium">
                      {day.title[language]}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-muted-foreground transition-transform text-xs",
                      isOpen && "rotate-180"
                    )}
                  >
                    &#9662;
                  </span>
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
