import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function useAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "page_view", { page_path: pathname });
    }
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);
}
