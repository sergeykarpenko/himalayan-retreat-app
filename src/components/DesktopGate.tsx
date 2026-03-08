import { type ReactNode } from "react";
import { Mountain } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import { useLanguage } from "@/contexts/LanguageContext";

export function DesktopGate({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone);

  if (isMobile || isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="max-w-sm text-center space-y-8">
        <Mountain className="mx-auto h-12 w-12 text-primary" />
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase mb-3">
            Himalayan Retreat
          </h1>
          <p className="text-muted-foreground">
            {t(
              "This app is designed for mobile devices",
              "Это приложение работает на мобильных устройствах"
            )}
          </p>
        </div>

        <div className="space-y-3">
          <img
            src="/qr-app.png"
            alt="QR code"
            className="mx-auto h-48 w-48 rounded-xl bg-white p-3"
          />
          <p className="text-sm text-muted-foreground">
            {t(
              "Scan the QR code with your phone",
              "Отсканируйте QR-код телефоном"
            )}
          </p>
        </div>

        <a
          href="https://himalayanholytemple.net"
          className="inline-block text-sm text-primary hover:underline"
        >
          {t("Visit main website", "Перейти на основной сайт")}
        </a>
      </div>
    </div>
  );
}
