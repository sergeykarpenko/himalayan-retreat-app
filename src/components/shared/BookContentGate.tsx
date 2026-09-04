import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface BookContentGateProps {
  language: "en" | "ru";
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BookContentGate({
  language,
  open,
  onCancel,
  onConfirm,
}: BookContentGateProps) {
  const [adultConfirmed, setAdultConfirmed] = useState(false);

  const cancel = () => {
    setAdultConfirmed(false);
    onCancel();
  };

  const confirm = () => {
    setAdultConfirmed(false);
    onConfirm();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAdultConfirmed(false);
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const isRussian = language === "ru";
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-warning-title"
        className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h2
                id="book-warning-title"
                className="text-base font-medium normal-case tracking-normal"
              >
                {isRussian ? "Предупреждение о содержании" : "Content warning"}
              </h2>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-amber-500">
                {isRussian ? "Только для лиц 18+" : "Adults 18+ only"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label={isRussian ? "Закрыть" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            {isRussian
              ? "Книга содержит обсуждение суицида, психического здоровья, изменённых состояний сознания, психоактивных веществ и духовных практик."
              : "This book discusses suicide, mental health, altered states, psychoactive substances, and spiritual practices."}
          </p>
          <p>
            {isRussian
              ? "Материал не является медицинской рекомендацией и не заменяет помощь квалифицированного врача или специалиста по психическому здоровью. Не прекращайте лечение и не меняйте назначенные препараты на основании этой книги."
              : "The material is not medical advice and does not replace care from a qualified physician or mental-health professional. Do not stop treatment or change prescribed medication based on this book."}
          </p>
          <p>
            {isRussian
              ? "Если вы или другой человек находитесь в непосредственной опасности, обратитесь в местные экстренные службы или за срочной профессиональной помощью."
              : "If you or another person is in immediate danger, contact local emergency services or seek urgent professional help."}
          </p>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
          <input
            type="checkbox"
            checked={adultConfirmed}
            onChange={(event) => setAdultConfirmed(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span className="text-sm">
            {isRussian
              ? "Мне исполнилось 18 лет, и я понимаю характер материала."
              : "I am at least 18 years old and understand the nature of this material."}
          </span>
        </label>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={cancel}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
          >
            {isRussian ? "Отмена" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={!adultConfirmed}
            onClick={confirm}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRussian ? "Открыть книгу" : "Open book"}
          </button>
        </div>
      </section>
    </div>
  );
}
