import { Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTelegramLogin } from "@/hooks/useTelegramLogin";

interface Props {
  size?: "icon" | "normal" | "large" | "text";
}

export function TelegramLoginButton({ size = "large" }: Props) {
  const { t } = useLanguage();
  const { loginUrl, onLinkClick, polling, cancel } = useTelegramLogin();

  // Inline text link for locked-content rows (e.g. schedule/guide accordions)
  if (size === "text") {
    if (polling) {
      return (
        <span data-testid="telegram-login-inline" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-[#2AABEE]" />
          {t("Check Telegram", "Проверьте Telegram")}
        </span>
      );
    }
    return (
      <a
        href={loginUrl}
        onClick={onLinkClick}
        data-testid="telegram-login-inline"
        className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors"
      >
        {t("Sign in", "Войдите")}
      </a>
    );
  }

  // Icon-only for header (compact)
  if (size === "icon") {
    if (polling) {
      return (
        <div data-testid="telegram-login">
          <Loader2 className="h-4 w-4 animate-spin text-[#2AABEE]" />
        </div>
      );
    }
    return (
      <a
        href={loginUrl}
        onClick={onLinkClick}
        data-testid="telegram-login"
        className="flex items-center justify-center rounded-full bg-[#2AABEE] p-1.5 text-white transition-opacity hover:opacity-90 active:opacity-80"
        aria-label={t("Login with Telegram", "Войти через Telegram")}
      >
        <Send className="h-4 w-4" />
      </a>
    );
  }

  const isLarge = size === "large";

  if (polling) {
    return (
      <div className="flex flex-col items-center gap-3" data-testid="telegram-login">
        <Loader2 className={`animate-spin text-[#2AABEE] ${isLarge ? "h-8 w-8" : "h-5 w-5"}`} />
        <p className={`text-muted-foreground ${isLarge ? "text-sm" : "text-xs"}`}>
          {t(
            "Press Start in Telegram, then come back here",
            "Нажмите Start в Telegram, затем вернитесь сюда"
          )}
        </p>
        <button
          onClick={cancel}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("Cancel", "Отмена")}
        </button>
      </div>
    );
  }

  return (
    <a
      href={loginUrl}
      onClick={onLinkClick}
      data-testid="telegram-login"
      className={`
        inline-flex items-center justify-center gap-2 rounded-full
        bg-[#2AABEE] text-white font-medium
        transition-opacity hover:opacity-90 active:opacity-80
        ${isLarge ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"}
      `}
    >
      <Send className={isLarge ? "h-5 w-5" : "h-4 w-4"} />
      {t("Sign in with Telegram", "Войти через Telegram")}
    </a>
  );
}
