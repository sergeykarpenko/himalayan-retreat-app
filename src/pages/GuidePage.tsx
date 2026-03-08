import {
  Backpack,
  Apple,
  HeartPulse,
  MapPin,
  ScrollText,
  Leaf,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { guideSections } from "@/data/guide";
import { useState } from "react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  backpack: Backpack,
  apple: Apple,
  "heart-pulse": HeartPulse,
  "map-pin": MapPin,
  scroll: ScrollText,
  leaf: Leaf,
};

// Guest: only "packing"
// Logged in, not paid: + "diet", "health"
// Paid: everything
const GUEST_SECTIONS = new Set(["packing"]);
const FREE_SECTIONS = new Set(["packing", "diet", "health"]);

export function GuidePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isPaid = user?.paid === true;
  const [openSection, setOpenSection] = useState<string | null>("packing");

  function isSectionLocked(id: string): boolean {
    if (isPaid) return false;
    if (!user) return !GUEST_SECTIONS.has(id);
    return !FREE_SECTIONS.has(id);
  }

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-2">
          {t("Retreat Guide", "Гайд по ретриту")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("Everything you need to know", "Всё, что нужно знать")}
        </p>
      </div>

      <div className="px-4 pb-8 space-y-2">
        {guideSections.map((section) => {
          const Icon = iconMap[section.icon] || Leaf;
          const locked = isSectionLocked(section.id);
          const isOpen = !locked && openSection === section.id;

          return (
            <div
              key={section.id}
              className={cn(
                "rounded-2xl border border-border bg-card overflow-hidden",
                locked && "opacity-50"
              )}
            >
              <button
                onClick={() =>
                  locked ? undefined : setOpenSection(isOpen ? null : section.id)
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
                <span className="flex-1 text-sm font-medium">
                  {section.title[language]}
                </span>
                {locked ? (
                  <span className="text-xs text-muted-foreground">
                    {!user
                      ? language === "ru" ? "Войдите" : "Sign in"
                      : language === "ru" ? "Для участников" : "Participants"
                    }
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
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-foreground/80"
                      >
                        <span className="text-primary mt-1 shrink-0">
                          &bull;
                        </span>
                        <span>{item[language]}</span>
                      </li>
                    ))}
                  </ul>
                  {section.id === "diet" && (
                    isPaid ? (
                      <a
                        href="https://fasting.himalayanholytemple.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        {t("Fasting Guide", "Гайд по голоданию")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground/50">
                        <Lock className="h-3 w-3" />
                        {t(
                          "Fasting Guide — available for retreat participants",
                          "Гайд по голоданию — доступен участникам ретрита"
                        )}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
