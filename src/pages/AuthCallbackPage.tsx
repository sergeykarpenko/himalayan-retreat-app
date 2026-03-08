import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { Loader2 } from "lucide-react";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });

    if (!data.id || !data.hash) {
      setError(t("Invalid auth link", "Неверная ссылка авторизации"));
      return;
    }

    // Convert id and auth_date to numbers for the API
    const payload = {
      ...data,
      id: Number(data.id),
      auth_date: Number(data.auth_date),
    };

    verifyTelegramAuth(payload)
      .then((user) => {
        login(user);
        navigate("/", { replace: true });
      })
      .catch(() => {
        setError(t("Auth verification failed", "Ошибка верификации"));
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-primary underline"
        >
          {t("Go to home page", "На главную")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {t("Signing in...", "Выполняется вход...")}
      </p>
    </div>
  );
}
