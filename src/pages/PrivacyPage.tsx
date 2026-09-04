import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { requestPrivacySettings } from "@/lib/privacy";

export function PrivacyPage() {
  const { language } = useLanguage();
  const ru = language === "ru";

  return (
    <article className="animate-fade-in px-4 pb-10 pt-6">
      <div className="mb-6 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <div>
          <h2 className="text-xl font-light tracking-widest uppercase">
            {ru ? "Конфиденциальность" : "Privacy Policy"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {ru ? "Обновлено 28 июля 2026 г." : "Last updated July 28, 2026"}
          </p>
        </div>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <LegalSection title={ru ? "Кто мы" : "Who we are"}>
          <p>
            {ru
              ? "Приложение Himalayan Retreat управляется Himalayan Holy Temple. По вопросам конфиденциальности: info@himalayanholytemple.org."
              : "Himalayan Retreat is operated by Himalayan Holy Temple. For privacy questions, contact info@himalayanholytemple.org."}
          </p>
        </LegalSection>

        <LegalSection title={ru ? "Какие данные обрабатываются" : "Data we process"}>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              {ru
                ? "Telegram ID, имя, username и фото, если вы входите через Telegram."
                : "Telegram ID, name, username, and photo when you sign in with Telegram."}
            </li>
            <li>
              {ru
                ? "Статус доступа участника ретрита и техническая серверная сессия."
                : "Retreat access status and a technical server session."}
            </li>
            <li>
              {ru
                ? "Технические журналы безопасности: время, IP-адрес, тип устройства и сведения об ошибках."
                : "Security logs such as time, IP address, device type, and error details."}
            </li>
            <li>
              {ru
                ? "Язык, privacy-настройки и загруженные аудиофайлы, хранящиеся локально на вашем устройстве."
                : "Language, privacy choices, and downloaded audio stored locally on your device."}
            </li>
            <li>
              {ru
                ? "В web-версии — аналитические или маркетинговые данные только после отдельного согласия."
                : "In the web version, analytics or marketing data only after separate consent."}
            </li>
          </ul>
        </LegalSection>

        <LegalSection title={ru ? "Зачем используются данные" : "Why we use data"}>
          <p>
            {ru
              ? "Для входа, проверки права доступа, работы расписания и материалов, защиты сервиса, поддержки пользователей и, при согласии, измерения работы web-версии и эффективности коммуникаций."
              : "To authenticate users, verify access, provide schedules and materials, secure the service, support users, and—with consent—measure the web version and communications."}
          </p>
        </LegalSection>

        <LegalSection title={ru ? "Сторонние сервисы" : "Service providers"}>
          <p>
            {ru
              ? "Для работы могут использоваться Telegram, Cloudflare и хостинг Himalayan Holy Temple. Google Analytics, Microsoft Clarity и Meta Pixel используются только в web-версии после соответствующего согласия. В iOS/Android store-сборках сторонние tracking-скрипты отключены."
              : "The service may use Telegram, Cloudflare, and Himalayan Holy Temple hosting. Google Analytics, Microsoft Clarity, and Meta Pixel are used only in the web version after the relevant consent. Third-party tracking scripts are disabled in iOS/Android store builds."}
          </p>
        </LegalSection>

        <LegalSection title={ru ? "Хранение и безопасность" : "Retention and security"}>
          <p>
            {ru
              ? "Сессия входа действует до семи дней. Локальные настройки и офлайн-аудио хранятся до выхода, очистки данных приложения или удаления пользователем. Серверные данные хранятся только столько, сколько необходимо для предоставления сервиса, безопасности и выполнения юридических обязанностей."
              : "The login session lasts up to seven days. Local settings and offline audio remain until logout, app-data clearing, or user deletion. Server data is retained only as needed to provide the service, protect it, and meet legal obligations."}
          </p>
        </LegalSection>

        <LegalSection title={ru ? "Ваши права" : "Your choices and rights"}>
          <p>
            {ru
              ? "Вы можете изменить согласие, запросить доступ, исправление или удаление данных и возразить против необязательной обработки. Доступность отдельных прав зависит от применимого законодательства."
              : "You can change consent, request access, correction or deletion, and object to optional processing. Specific rights depend on applicable law."}
          </p>
          <button
            type="button"
            onClick={requestPrivacySettings}
            className="mt-3 rounded-xl border border-border px-4 py-2 text-sm font-medium text-primary"
          >
            {ru ? "Настроить конфиденциальность" : "Open privacy settings"}
          </button>
        </LegalSection>

        <LegalSection title={ru ? "Возраст" : "Age"}>
          <p>
            {ru
              ? "Приложение и материалы предназначены для лиц от 18 лет. Мы сознательно не запрашиваем данные детей."
              : "The app and its materials are intended for adults aged 18 and over. We do not knowingly request children’s data."}
          </p>
        </LegalSection>

        <LegalSection title={ru ? "Контакты" : "Contact"}>
          <a
            href="mailto:info@himalayanholytemple.org"
            className="text-primary underline"
          >
            info@himalayanholytemple.org
          </a>
        </LegalSection>
      </div>
    </article>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium normal-case tracking-normal text-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
