import { Link } from "react-router-dom";
import {
  Calendar,
  Headphones,
  BookOpen,
  Star,
  MessageCircle,
  Mountain,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { TelegramBrowserBanner } from "@/components/shared/TelegramBrowserBanner";

const quickLinks = [
  {
    to: "/schedule",
    icon: Calendar,
    label: { en: "Schedule", ru: "Расписание" },
    desc: { en: "Daily program", ru: "Программа по дням" },
  },
  {
    to: "/meditations",
    icon: Headphones,
    label: { en: "Meditations", ru: "Медитации" },
    desc: { en: "Audio & Books", ru: "Аудио и книги" },
  },
  {
    to: "/guide",
    icon: BookOpen,
    label: { en: "Guide", ru: "Гайд" },
    desc: { en: "Preparation tips", ru: "Рекомендации" },
  },
  {
    to: "/about",
    icon: Mountain,
    label: { en: "About", ru: "О центре" },
    desc: { en: "Our center & team", ru: "Центр и команда" },
  },
  {
    to: "/testimonials",
    icon: Star,
    label: { en: "Testimonials", ru: "Отзывы" },
    desc: { en: "Participant stories", ru: "Истории участников" },
  },
  {
    to: "/contact",
    icon: MessageCircle,
    label: { en: "Contact", ru: "Контакты" },
    desc: { en: "Get in touch", ru: "Связаться" },
  },
];

export function HomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <TelegramBrowserBanner />
      <InstallBanner />

      <div className="px-4 pt-8 pb-6 text-center">
        <div className="mb-4 text-4xl">
          <Mountain className="mx-auto h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-light tracking-widest uppercase mb-2">
          {t("Himalayan Retreat", "Гималайский Ретрит")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "Your journey of healing and self-discovery",
            "Ваше путешествие исцеления и самопознания"
          )}
        </p>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <Calendar className="h-6 w-6 shrink-0 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">
            {t("Next retreat", "Следующий ретрит")}
          </p>
          <p className="text-base font-medium">
            {t("April 1 — 11, 2026", "1 — 11 апреля 2026")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {quickLinks.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={label.en}
            to={to}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">{label[language]}</span>
            <span className="text-xs text-muted-foreground">
              {desc[language]}
            </span>
          </Link>
        ))}
      </div>

      <div className="px-4 pb-8">
        <a
          href="https://t.me/himalayan_retreat_bot?start=book"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-3.5 text-primary-foreground font-medium transition-opacity hover:opacity-90"
        >
          <Phone className="h-5 w-5" />
          {t("Book a Retreat Spot", "Забронировать место")}
        </a>
      </div>
    </div>
  );
}
