import { useState, useEffect } from "react";
import { Download, X, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function InstallBanner() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    const dismissed = sessionStorage.getItem("install-dismissed");
    if (!isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("install-dismissed", "1");
  };

  return (
    <a
      href="https://t.me/himalayan_retreat_bot?start=install"
      target="_blank"
      rel="noopener noreferrer"
      className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 animate-fade-in active:bg-primary/10 transition-colors"
    >
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
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
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <ExternalLink className="h-4 w-4 text-primary/60" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(); }}
          className="ml-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </a>
  );
}
