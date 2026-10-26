/**
 * Непальское время (UTC+5:45) — ретрит начинается там, а не у пользователя.
 */
const NEPAL_OFFSET = "+05:45";

/**
 * Начало потока, под который написан распорядок в src/data/schedule.ts.
 *
 * НЕ ИСПОЛЬЗОВАТЬ как «начало ближайшего ретрита»: это конкретный прошедший
 * поток. Дата ближайшего приходит с сайта через /api/retreat. Константа
 * оставлена, потому что к этому же потоку привязан распорядок.
 */
export const SCHEDULE_RETREAT_START = new Date(`2026-09-23T00:00:00${NEPAL_OFFSET}`);

/** Дату вида YYYY-MM-DD превращает в начало дня по непальскому времени. */
export function parseRetreatStart(startDate: string | null | undefined): Date | null {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null;
  const d = new Date(`${startDate}T00:00:00${NEPAL_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Сколько дней осталось до начала потока. Отрицательное — поток начался или
 * прошёл. null, если начало неизвестно: тогда обратный отсчёт не показывается
 * вовсе, а не считается от вшитой даты.
 */
export function getDaysUntilRetreat(
  start: Date | null,
  now: Date = new Date(),
): number | null {
  if (!start) return null;
  return Math.ceil((start.getTime() - now.getTime()) / 86_400_000);
}

const RAMP_DAYS = 60;
const MIN_INTENSITY = 0.35;

/**
 * Visual "approach intensity" (0.35–1) used to fade the pyramid glow in as the
 * retreat nears. Flat and faint further than RAMP_DAYS out, warms up steadily,
 * fully lit once the retreat has started.
 */
export function getApproachIntensity(
  start: Date | null,
  now: Date = new Date(),
): number {
  const daysLeft = getDaysUntilRetreat(start, now);
  // Начало неизвестно — светим ровно и неярко, а не «как будто уже началось».
  if (daysLeft === null) return MIN_INTENSITY;
  if (daysLeft <= 0) return 1;
  if (daysLeft >= RAMP_DAYS) return MIN_INTENSITY;
  return MIN_INTENSITY + (1 - daysLeft / RAMP_DAYS) * (1 - MIN_INTENSITY);
}

/** Russian pluralization for "день" (1 день / 2 дня / 5 дней). */
export function pluralizeRuDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
}
