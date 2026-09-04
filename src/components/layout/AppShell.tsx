import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { PyramidBackdrop } from "./PyramidBackdrop";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppShell() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScrollToTop />
      <PyramidBackdrop />
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
        <footer className="mx-4 mb-4 mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">
            {t("Privacy", "Конфиденциальность")}
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            {t("Terms & Safety", "Условия и безопасность")}
          </Link>
          <Link to="/account" className="hover:text-foreground">
            {t("Account & Data", "Аккаунт и данные")}
          </Link>
        </footer>
      </main>
      <BottomNav />
    </div>
  );
}
