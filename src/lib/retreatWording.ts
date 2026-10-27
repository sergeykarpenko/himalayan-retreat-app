import type { RetreatInfo } from "@/hooks/useRetreat";

/**
 * Пол потока приписывается к дате — так же, как на сайте: «16–24 ноября
 * 2026, мужской поток». Слова взяты у сайта дословно (его build.js), чтобы об
 * одном и том же потоке сайт и приложение говорили одинаково. Пустое значение
 * — смешанный поток, и тогда сайт тоже ничего не добавляет.
 *
 * Лежит здесь, а не в странице, потому что говорят это и главная, и
 * расписание. Одну и ту же фразу сайта в двух местах держать нельзя: правят
 * одно, забывают другое — и приложение начинает противоречить само себе.
 */
const AUDIENCE_TAIL: Record<string, { en: string; ru: string }> = {
  men: { en: ", men's group", ru: ", мужской поток" },
  women: { en: ", women's group", ru: ", женский поток" },
};

/** Даты потока с приписанным полом: «November 16–24, 2026, men's group». */
export function datesWithAudience(
  retreat: Pick<RetreatInfo, "dates" | "audience">,
  language: "en" | "ru",
): string {
  const tail = AUDIENCE_TAIL[retreat.audience];
  return `${retreat.dates[language]}${tail ? tail[language] : ""}`;
}
