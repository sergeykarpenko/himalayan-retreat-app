import {
  MessageCircle,
  Globe,
  Mail,
  ExternalLink,
  Shield,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const contacts = [
  {
    icon: Shield,
    label: { en: "SimpleX Chat (Private)", ru: "SimpleX Chat (Приватный)" },
    desc: {
      en: "Most secure way to reach us",
      ru: "Самый безопасный способ связаться",
    },
    href: "https://simplex.chat/contact#/?v=2-7&smp=smp%3A%2F%2FenEkec4hlR3UtKx2NQpOdK28sg-vt8ljn_Y-FVq1JFE%3D%40smp14.simplex.im%2FSnqJCxJC-O1yMJyJvOtlSi3FulzyFtYj%23%2F%3Fv%3D1-3%26dh%3DMCowBQYDK2VuAyEAi6GWoUFUz8uxHd7pIjK6TZOc9HbnL7cP6MZhI_d0g1I%253D%26srv%3Daspkyu2sopsnizbyfabtsczm3fqiszp3r3m3nyknqdl6ipe6cz6emqd.onion",
    cta: { en: "Open SimpleX", ru: "Открыть SimpleX" },
  },
  {
    icon: MessageCircle,
    label: { en: "Telegram Bot", ru: "Telegram Бот" },
    desc: {
      en: "AI-powered assistant for quick answers",
      ru: "AI-ассистент для быстрых ответов",
    },
    href: "https://t.me/himalayan_retreat_bot",
    cta: { en: "Open Telegram", ru: "Открыть Telegram" },
  },
  {
    icon: Globe,
    label: { en: "Website", ru: "Сайт" },
    desc: {
      en: "Full information about retreats",
      ru: "Полная информация о ретритах",
    },
    href: "https://himalayanholytemple.net",
    cta: { en: "Visit Website", ru: "Перейти на сайт" },
  },
  {
    icon: Mail,
    label: { en: "Email", ru: "Email" },
    desc: {
      en: "For detailed inquiries",
      ru: "Для подробных вопросов",
    },
    href: "mailto:info@himalayanholytemple.org",
    cta: { en: "Send Email", ru: "Написать" },
  },
  {
    icon: GraduationCap,
    label: { en: "Exorcism & Hypnotherapy School", ru: "Школа экзорцизма и гипнотерапии" },
    desc: {
      en: "Community on Skool",
      ru: "Сообщество на Skool",
    },
    href: "https://www.skool.com/exorcism-hypnotherapy-scool-5824",
    cta: { en: "Join", ru: "Присоединиться" },
  },
];

export function ContactPage() {
  const { t, language } = useLanguage();

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-2">
          {t("Contact", "Контакты")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("Choose the most convenient way", "Выберите удобный способ связи")}
        </p>
      </div>

      <div className="px-4 pb-8 space-y-3">
        {contacts.map(({ icon: Icon, label, desc, href, cta }) => (
          <a
            key={label.en}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label[language]}</p>
              <p className="text-xs text-muted-foreground">{desc[language]}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <span className="hidden sm:inline">{cta[language]}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
