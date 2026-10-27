import { useLanguage } from "@/contexts/LanguageContext";
import { useRetreat } from "@/hooks/useRetreat";
import { datesWithAudience } from "@/lib/retreatWording";
import { pluralizeRuDays } from "@/lib/retreatCountdown";

/**
 * Расписание — страница про ОДИН поток: тот, который сайт объявил ближайшим.
 *
 * Своего распорядка по дням у приложения нет. До 27.10.2026 здесь лежали девять
 * дней, написанные под сентябрьский поток: аккордеон с заголовками и
 * описаниями, часть за логином. Сайт такого не публикует — у него на формат
 * одна строка structureRu/En, — и когда ближайшим стал ноябрьский поток,
 * страница продолжала показывать сентябрьский распорядок с припиской, что «у
 * предстоящего потока программа другая». Приписка была честной, но программы у
 * ноябрьского участника не было никакой.
 *
 * Теперь здесь только сказанное сайтом: его строка структуры и его же числа.
 * Пришло пустым — страница молчит, а не досочиняет. Своя программа разошлась бы
 * с сайтом, а участник прочитает её как обещание.
 */
export function SchedulePage() {
  const { t, language } = useLanguage();
  const retreatState = useRetreat();
  const retreat = retreatState.status === "ready" ? retreatState.retreat : null;

  const structure = retreat ? retreat.programme.structure[language].trim() : "";

  // Числа формата — тоже с сайта. Ноль и null означают «не сказано», и тогда
  // строки нет вовсе: «Церемоний: 0» — это утверждение, которого сайт не делал.
  const facts = !retreat
    ? []
    : [
        retreat.durationDays
          ? {
              label: t("Duration", "Длительность"),
              value: t(
                `${retreat.durationDays} days`,
                `${retreat.durationDays} ${pluralizeRuDays(retreat.durationDays)}`,
              ),
            }
          : null,
        retreat.programme.ceremonies
          ? {
              label: t("Ceremonies", "Церемонии"),
              value: String(retreat.programme.ceremonies),
            }
          : null,
        retreat.programme.microdosingSessions
          ? {
              label: t("Microdosing sessions", "Сессии микродозинга"),
              value: String(retreat.programme.microdosingSessions),
            }
          : null,
        retreat.programme.groupSize
          ? {
              label: t("Group", "Группа"),
              value: t(
                `up to ${retreat.programme.groupSize}`,
                `до ${retreat.programme.groupSize}`,
              ),
            }
          : null,
      ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-light tracking-widest uppercase mb-2">
          {t("Schedule", "Расписание")}
        </h2>

        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          {retreat
            ? t(
                `Programme of the ${datesWithAudience(retreat, "en")} retreat.`,
                `Программа потока ${datesWithAudience(retreat, "ru")}.`,
              )
            : retreatState.status === "loading"
              ? t("Loading…", "Загружаем…")
              : t("Dates to be announced", "Даты уточняются")}
        </p>
      </div>

      <div className="px-4 pb-8 space-y-2">
        {structure && (
          <div className="rounded-2xl border border-border bg-card/55 backdrop-blur-md p-4">
            <p className="text-sm text-foreground/80 leading-relaxed">
              {structure}
            </p>
          </div>
        )}

        {retreat && !structure && (
          <p className="text-sm text-muted-foreground/80">
            {t(
              "The programme has not been published yet.",
              "Программа пока не опубликована.",
            )}
          </p>
        )}

        {facts.length > 0 && (
          <div className="rounded-2xl border border-border bg-card/55 backdrop-blur-md p-4 space-y-2">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="text-xs text-muted-foreground">
                  {fact.label}
                </span>
                <span className="text-sm">{fact.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
