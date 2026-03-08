import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
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
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 animate-fade-in">
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-foreground/80">
        {t(
          "Add to Home Screen for the best experience",
          "Добавьте на главный экран для лучшего опыта"
        )}
      </p>
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
