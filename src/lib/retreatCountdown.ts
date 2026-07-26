export const RETREAT_START = new Date("2026-09-23T00:00:00+05:45");

/** Days remaining until the retreat starts. Negative once it has begun/passed. */
export function getDaysUntilRetreat(now: Date = new Date()): number {
  return Math.ceil((RETREAT_START.getTime() - now.getTime()) / 86_400_000);
}

const RAMP_DAYS = 60;
const MIN_INTENSITY = 0.35;

/**
 * Visual "approach intensity" (0.35–1) used to fade the pyramid glow in as the
 * retreat nears. Flat and faint further than RAMP_DAYS out, warms up steadily,
 * fully lit once the retreat has started.
 */
export function getApproachIntensity(now: Date = new Date()): number {
  const daysLeft = getDaysUntilRetreat(now);
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
