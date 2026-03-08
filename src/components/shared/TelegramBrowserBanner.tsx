import { useState, useEffect } from "react";
import { Globe, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

function isTelegramBrowser(): boolean {
  const w = window as any;
  // Telegram WebView injects these objects
  if (w.TelegramWebviewProxy || w.Telegram?.WebApp) return true;
  // Fallback: iOS WebView has "Mobile" but no "Safari" in UA
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua) && /Mobile/i.test(ua) && !/Safari/i.test(ua)) return true;
  // Android WebView: has "wv" flag
  if (/; wv\)/i.test(ua)) return true;
  return false;
}

export function TelegramBrowserBanner() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    const dismissed = sessionStorage.getItem("tg-browser-dismissed");
    if (!isStandalone && !dismissed && isTelegramBrowser()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("tg-browser-dismissed", "1");
  };

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 animate-fade-in">
      <div className="flex items-start gap-3">
        <Globe className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-1">
            {t(
              "Open in browser for full experience",
              "Откройте в браузере для полного доступа"
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {isIOS
              ? t(
                  "Tap ··· → Open in Safari",
                  "Нажмите ··· → Открыть в Safari"
                )
              : t(
                  "Tap ⋮ → Open in Chrome",
                  "Нажмите ⋮ → Открыть в Chrome"
                )}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
