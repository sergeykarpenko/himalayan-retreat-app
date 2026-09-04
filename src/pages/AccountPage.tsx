import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type DeletionStatus = "idle" | "submitting" | "accepted" | "error";

export function AccountPage() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [status, setStatus] = useState<DeletionStatus>("idle");
  const ru = language === "ru";

  const requestDeletion = async () => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/account-deletion", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("request_failed");
      await logout();
      setStatus("accepted");
    } catch {
      setStatus("error");
    }
  };

  return (
    <article className="animate-fade-in px-4 pb-10 pt-6">
      <div className="mb-6 flex items-start gap-3">
        <Trash2 className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
        <div>
          <h2 className="text-xl font-light tracking-widest uppercase">
            {ru ? "Аккаунт и данные" : "Account & Data"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {ru
              ? "Управление доступом и удалением"
              : "Manage access and deletion"}
          </p>
        </div>
      </div>

      <div className="space-y-5 text-sm leading-relaxed text-foreground/80">
        <p>
          {ru
            ? "Удаление аккаунта удаляет профиль авторизации и запрос на удаление связанных данных из сервисов Himalayan Retreat. Данные, которые необходимо сохранить по закону или для защиты от злоупотреблений, могут храниться ограниченное время."
            : "Account deletion removes the authentication profile and requests deletion of related Himalayan Retreat service data. Data required by law or to prevent abuse may be retained for a limited period."}
        </p>

        {status === "accepted" ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-green-600">
            {ru
              ? "Запрос принят. Вы вышли из аккаунта."
              : "Deletion request accepted. You have been signed out."}
          </div>
        ) : (
          <button
            type="button"
            disabled={!user || status === "submitting"}
            onClick={requestDeletion}
            className="w-full rounded-xl bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "submitting"
              ? ru
                ? "Отправка…"
                : "Submitting…"
              : ru
                ? "Удалить мой аккаунт"
                : "Delete my account"}
          </button>
        )}

        {!user && status !== "accepted" && (
          <p className="text-xs text-muted-foreground">
            {ru
              ? "Войдите через Telegram, чтобы отправить подтверждённый запрос из приложения."
              : "Sign in with Telegram to submit a verified request from the app."}
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            {ru
              ? "Автоматический запрос сейчас недоступен. Отправьте письмо с Telegram username или ID."
              : "Automated deletion is currently unavailable. Email us with your Telegram username or ID."}
          </p>
        )}

        <p>
          {ru
            ? "Удаление также можно запросить по адресу "
            : "You can also request deletion at "}
          <a
            href="mailto:info@himalayanholytemple.org?subject=Himalayan%20Retreat%20account%20deletion"
            className="text-primary underline"
          >
            info@himalayanholytemple.org
          </a>
          .
        </p>
      </div>
    </article>
  );
}
