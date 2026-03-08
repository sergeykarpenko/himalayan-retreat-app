import { Link } from "react-router-dom";
import {
  Calendar,
  Headphones,
  BookOpen,
  Star,
  MessageCircle,
  Mountain,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InstallBanner } from "@/components/shared/InstallBanner";

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
    desc: { en: "Guided audio", ru: "Аудио-медитации" },
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

      <div className="grid grid-cols-2 gap-3 px-4 pb-8">
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
    </div>
  );
}
