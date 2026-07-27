import { useState } from "react";
import { LogIn, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTelegramLogin } from "@/hooks/useTelegramLogin";

export function SignInBanner() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { trigger, polling } = useTelegramLogin();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("signin-banner-dismissed") === "1"
  );

  if (user || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("signin-banner-dismissed", "1");
  };

  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 animate-fade-in">
      <button
        onClick={trigger}
        disabled={polling}
        className="flex flex-1 min-w-0 items-center gap-3 text-left active:opacity-70 transition-opacity disabled:active:opacity-100"
      >
        {polling ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
        ) : (
          <LogIn className="h-5 w-5 shrink-0 text-primary" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {polling
              ? t("Press Start in Telegram, then come back here", "Нажмите Start в Telegram, затем вернитесь сюда")
              : t("Sign in for full access", "Войдите для полного доступа")}
          </p>
          {!polling && (
            <p className="text-xs text-muted-foreground">
              {t(
                "Unlock the schedule, meditations and guide",
                "Откройте расписание, медитации и гайд"
              )}
            </p>
          )}
        </div>
      </button>
      {!polling && (
        <button
          onClick={dismiss}
          aria-label={t("Dismiss", "Скрыть")}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
