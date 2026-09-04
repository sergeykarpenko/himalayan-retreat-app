import {
  Backpack,
  Apple,
  HeartPulse,
  MapPin,
  ScrollText,
  Leaf,
  ExternalLink,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { TelegramLoginButton } from "@/components/shared/TelegramLoginButton";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GuideSection {
  id: string;
  title: { en: string; ru: string };
  icon: string;
  items: { en: string; ru: string }[];
}

const SECTION_CATALOG = [
  { id: "packing", title: { en: "What to Bring", ru: "Что взять с собой" } },
  { id: "diet", title: { en: "Diet & Nutrition", ru: "Питание и диета" } },
  { id: "health", title: { en: "Health & Safety", ru: "Здоровье и безопасность" } },
  { id: "getting-there", title: { en: "Getting There", ru: "Как добраться" } },
  { id: "rules", title: { en: "Guidelines", ru: "Правила" } },
  { id: "after", title: { en: "After the Retreat", ru: "После ретрита" } },
] as const;

const iconMap: Record<string, LucideIcon> = {
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
  const { user, loading: authLoading } = useAuth();
  const isPaid = user?.paid === true;
  const [openSection, setOpenSection] = useState<string | null>("packing");
  const [guideSections, setGuideSections] = useState<GuideSection[]>([]);
  const [fastingGuideUrl, setFastingGuideUrl] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    fetch("/api/guide", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("guide_unavailable");
        return response.json() as Promise<{
          sections?: GuideSection[];
          fastingGuideUrl?: string | null;
        }>;
      })
      .then((payload) => {
        setGuideSections(payload.sections ?? []);
        setFastingGuideUrl(payload.fastingGuideUrl ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setGuideSections([]);
          setFastingGuideUrl(null);
        }
      });
    return () => controller.abort();
  }, [authLoading, user?.id, user?.paid]);

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
        {SECTION_CATALOG.map((catalogSection) => {
          const section = guideSections.find((item) => item.id === catalogSection.id);
          const displaySection = section ?? { ...catalogSection, icon: "leaf", items: [] };
          const Icon = iconMap[displaySection.icon] || Leaf;
          const locked = !section || isSectionLocked(displaySection.id);
          const isOpen = !locked && openSection === displaySection.id;

          return (
            <div
              key={displaySection.id}
              className={cn(
                "rounded-2xl border border-border bg-card/55 backdrop-blur-md overflow-hidden",
                locked && "opacity-50"
              )}
            >
              {locked ? (
                <div className="flex w-full items-center gap-3 p-4 text-left">
                  <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">
                    {displaySection.title[language]}
                  </span>
                  {!user ? (
                    <TelegramLoginButton size="text" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {language === "ru" ? "Для участников" : "Participants"}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setOpenSection(isOpen ? null : displaySection.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                  <span className="flex-1 text-sm font-medium">
                    {displaySection.title[language]}
                  </span>
                  <span
                    className={cn(
                      "text-muted-foreground transition-transform text-xs",
                      isOpen && "rotate-180"
                    )}
                  >
                    &#9662;
                  </span>
                </button>
              )}
              {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                  <ul className="space-y-2">
                    {displaySection.items.map((item, i) => (
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
                  {displaySection.id === "diet" && (
                    isPaid && fastingGuideUrl ? (
                      <a
                        href={fastingGuideUrl}
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
