import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function TermsPage() {
  const { language } = useLanguage();
  const ru = language === "ru";

  return (
    <article className="animate-fade-in px-4 pb-10 pt-6">
      <div className="mb-6 flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
        <div>
          <h2 className="text-xl font-light tracking-widest uppercase">
            {ru ? "Условия и безопасность" : "Terms & Safety"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {ru ? "Для лиц от 18 лет" : "For adults aged 18 and over"}
          </p>
        </div>
      </div>

      <div className="space-y-5 text-sm leading-relaxed text-foreground/80">
        <p>
          {ru
            ? "Материалы приложения предназначены для информационных, образовательных и духовных целей. Они не являются медицинской, психиатрической, психологической или юридической консультацией."
            : "App materials are provided for informational, educational, and spiritual purposes. They are not medical, psychiatric, psychological, or legal advice."}
        </p>
        <p>
          {ru
            ? "Не прекращайте лечение, не меняйте назначенные препараты и не принимайте решения о здоровье на основании приложения или книги. Обсуждайте такие решения с квалифицированным специалистом."
            : "Do not stop treatment, change prescribed medication, or make health decisions based on the app or book. Discuss those decisions with a qualified professional."}
        </p>
        <p>
          {ru
            ? "Некоторые материалы содержат обсуждение суицида, травмы, изменённых состояний сознания, психоактивных веществ и духовных практик. Читатель самостоятельно решает, подходит ли ему такой материал."
            : "Some materials discuss suicide, trauma, altered states, psychoactive substances, and spiritual practices. Readers should decide whether such content is appropriate for them."}
        </p>
        <p>
          {ru
            ? "Приложение не рекомендует нарушать закон. Правовой статус веществ и практик зависит от страны и региона."
            : "The app does not encourage unlawful conduct. The legal status of substances and practices varies by country and region."}
        </p>
        <p>
          {ru
            ? "Если вы или другой человек находитесь в непосредственной опасности, обратитесь в местные экстренные службы или за срочной профессиональной помощью."
            : "If you or another person is in immediate danger, contact local emergency services or seek urgent professional help."}
        </p>
        <p>
          {ru
            ? "Используя приложение, вы подтверждаете, что вам исполнилось 18 лет и вы понимаете эти ограничения."
            : "By using the app, you confirm that you are at least 18 and understand these limitations."}
        </p>
      </div>
    </article>
  );
}
