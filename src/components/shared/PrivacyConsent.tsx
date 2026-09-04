import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isNativeApp } from "@/lib/platform";
import {
  getPrivacyConsent,
  initializeConsentedTracking,
  OPEN_PRIVACY_SETTINGS_EVENT,
  savePrivacyConsent,
} from "@/lib/privacy";

type ConsentView = "closed" | "banner" | "settings";

export function PrivacyConsent() {
  const { t } = useLanguage();
  const existingConsent = getPrivacyConsent();
  const [view, setView] = useState<ConsentView>(() =>
    existingConsent || isNativeApp() ? "closed" : "banner",
  );
  const [analytics, setAnalytics] = useState(
    existingConsent?.analytics ?? false,
  );
  const [marketing, setMarketing] = useState(
    existingConsent?.marketing ?? false,
  );

  useEffect(() => {
    initializeConsentedTracking();
    const openSettings = () => {
      const consent = getPrivacyConsent();
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
      setView("settings");
    };
    window.addEventListener(OPEN_PRIVACY_SETTINGS_EVENT, openSettings);
    return () =>
      window.removeEventListener(OPEN_PRIVACY_SETTINGS_EVENT, openSettings);
  }, []);

  const save = (choice: { analytics: boolean; marketing: boolean }) => {
    const previous = getPrivacyConsent();
    const consent = savePrivacyConsent(choice);
    const revokedPreviouslyLoadedTracking =
      (previous?.analytics === true && !choice.analytics) ||
      (previous?.marketing === true && !choice.marketing);

    if (revokedPreviouslyLoadedTracking) {
      window.location.reload();
      return;
    }

    initializeConsentedTracking(consent);
    setView("closed");
  };

  if (view === "closed") return null;

  if (view === "banner") {
    return (
      <section
        className="fixed inset-x-3 bottom-20 z-[90] mx-auto max-w-lg rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl"
        aria-label={t("Privacy choices", "Настройки конфиденциальности")}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">
              {t("Your privacy choices", "Ваш выбор конфиденциальности")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t(
                "Optional analytics and marketing technologies are off until you choose. Essential storage keeps the app signed in and working offline.",
                "Необязательная аналитика и маркетинговые технологии отключены до вашего выбора. Необходимое хранилище поддерживает вход и офлайн-работу.",
              )}{" "}
              <Link to="/privacy" className="text-primary underline">
                {t("Privacy policy", "Политика конфиденциальности")}
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="rounded-xl border border-border px-2 py-2 text-xs font-medium"
          >
            {t("Reject", "Отклонить")}
          </button>
          <button
            type="button"
            onClick={() => setView("settings")}
            className="rounded-xl border border-border px-2 py-2 text-xs font-medium"
          >
            {t("Settings", "Настроить")}
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="rounded-xl bg-primary px-2 py-2 text-xs font-medium text-primary-foreground"
          >
            {t("Accept", "Принять")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-settings-title"
        className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="privacy-settings-title"
              className="text-base font-medium normal-case tracking-normal"
            >
              {t("Privacy settings", "Настройки конфиденциальности")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Store versions keep all third-party tracking disabled.",
                "В версиях из магазинов сторонний трекинг полностью отключён.",
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView("closed")}
            aria-label={t("Close", "Закрыть")}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-medium">
              {t("Essential", "Необходимые")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Authentication, security, language and offline downloads. Always active.",
                "Авторизация, безопасность, язык и офлайн-загрузки. Всегда активны.",
              )}
            </p>
          </div>
          <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
            <span>
              <span className="block text-sm font-medium">
                {t("Analytics", "Аналитика")}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Google Analytics and Microsoft Clarity on the web version.
              </span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              disabled={isNativeApp()}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
          </label>
          <label className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
            <span>
              <span className="block text-sm font-medium">
                {t("Marketing", "Маркетинг")}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Meta Pixel on the web version.
              </span>
            </span>
            <input
              type="checkbox"
              checked={marketing}
              disabled={isNativeApp()}
              onChange={(event) => setMarketing(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => save({ analytics, marketing })}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          {t("Save choices", "Сохранить выбор")}
        </button>
      </section>
    </div>
  );
}
