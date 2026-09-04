import { Apple } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppleLoginButton() {
  const { t } = useLanguage();
  if (import.meta.env.VITE_APPLE_SIGN_IN_ENABLED !== "true") return null;

  return (
    <a
      href="/api/apple-start"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
    >
      <Apple className="h-5 w-5" />
      {t("Sign in with Apple", "Войти через Apple")}
    </a>
  );
}
