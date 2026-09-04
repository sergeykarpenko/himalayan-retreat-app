import { useState } from "react";
import { Download, X, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isNativeApp, isStandaloneApp } from "@/lib/platform";

export function InstallBanner() {
  const { t } = useLanguage();
  const [show, setShow] = useState(
    () =>
      !isStandaloneApp() &&
      !sessionStorage.getItem("install-dismissed") &&
      !isNativeApp(),
  );

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("install-dismissed", "1");
  };

  return (
    <div
      className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 animate-fade-in active:bg-primary/10 transition-colors"
    >
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <a
        href="https://t.me/himalayan_retreat_bot?start=install"
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <p className="text-sm font-medium text-foreground">
          {t(
            "Add to Home Screen",
            "Добавьте на главный экран"
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(
            "Tap to get instructions in Telegram",
            "Нажмите — инструкция придёт в Telegram"
          )}
        </p>
      </a>
      <div className="flex items-center gap-1 shrink-0">
        <ExternalLink className="h-4 w-4 text-primary/60" />
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("Dismiss", "Скрыть")}
          className="ml-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
