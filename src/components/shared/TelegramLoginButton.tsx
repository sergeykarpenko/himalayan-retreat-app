import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface Props {
  size?: "icon" | "normal" | "large";
}

export function TelegramLoginButton({ size = "large" }: Props) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [polling, setPolling] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
    tokenRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleClick = () => {
    const token = generateToken();
    tokenRef.current = token;
    setPolling(true);

    // Open Telegram deep link
    window.location.href = `https://t.me/himalayan_retreat_bot?start=login_${token}`;

    // Start polling after a short delay (give user time to switch to Telegram)
    const startPolling = () => {
      intervalRef.current = setInterval(async () => {
        if (!tokenRef.current) return;
        try {
          const res = await fetch(`/api/auth-poll?token=${tokenRef.current}`);
          if (res.status === 200) {
            const user = await res.json();
            if (user && user.id) {
              login(user);
              stopPolling();
            }
          }
          // 202 = pending, keep polling
        } catch {
          // Network error, keep trying
        }
      }, 2000);
    };

    setTimeout(startPolling, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      stopPolling();
    }, 300000);
  };

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
      <button
        onClick={handleClick}
        data-testid="telegram-login"
        className="flex items-center justify-center rounded-full bg-[#2AABEE] p-1.5 text-white transition-opacity hover:opacity-90 active:opacity-80"
        aria-label={t("Login with Telegram", "Войти через Telegram")}
      >
        <Send className="h-4 w-4" />
      </button>
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
          onClick={stopPolling}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          {t("Cancel", "Отмена")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
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
    </button>
  );
}
