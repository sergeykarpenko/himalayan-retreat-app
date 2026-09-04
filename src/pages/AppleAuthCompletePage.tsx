import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppleAuthCompletePage() {
  const { refreshSession } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void refreshSession().then((authenticated) => {
      if (authenticated) {
        navigate("/", { replace: true });
      } else {
        setFailed(true);
      }
    });
  }, [navigate, refreshSession]);

  if (failed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive">
          {t(
            "Apple sign-in could not be completed.",
            "Не удалось завершить вход через Apple.",
          )}
        </p>
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="text-sm text-primary underline"
        >
          {t("Go to home page", "На главную")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {t("Completing sign-in…", "Завершаем вход…")}
      </p>
    </div>
  );
}
