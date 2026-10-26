import { json, methodNotAllowed } from "../_lib/http";
import { scheduleRetreatId } from "../../src/data/schedule";

/**
 * GET /api/retreat — даты, свободные места и цена ближайшего потока.
 *
 * Источник — сайт: https://himalayanholytemple.net/api/retreats.json, который
 * собирается из site-config.json. Приложение держит эти данные НЕ у себя
 * нарочно: до 04.10.2026 дата ближайшего потока была вшита в трёх местах
 * (src/data/schedule.ts, src/lib/retreatCountdown.ts и распорядок по дням) и
 * разъехалась с сайтом — приложение показывало «Следующий ретрит: 23 сентября
 * — 1 октября 2026» уже после того, как этот поток закончился.
 *
 * Запрос делается здесь, на сервере, а не из браузера: CSP приложения
 * (functions/_middleware.ts, public/_headers) держит connect-src 'self', то
 * есть сторонний origin из страницы недоступен — и правильно, так меньше
 * поверхности. Для страницы это свой же /api/retreat.
 *
 * КЛЮЧ. С 11.10.2026 фид закрыт: пока у сайта задан секрет BOT_FEED_TOKEN, он
 * отвечает 401 { error: "unauthorized" } всему, что пришло без заголовка
 * `Authorization: Bearer <ключ>`. Ключ приложения (RETREATS_TOKEN) — то же
 * значение, что у сайта и у бота; живёт он только здесь, на сервере, в браузер
 * не уходит. Пока ключ не задан, заголовок не отправляется и открытый фид
 * отвечает как раньше — так развёртывание без секрета не ломается.
 *
 * ОТКАЗ — FAIL-CLOSED: при любой беде отдаётся { known: false } без дат.
 * Показать устаревший поток как предстоящий хуже, чем не показать никакого:
 * именно это приложение и делало. Интерфейс в этом случае говорит, что даты
 * уточняются.
 */

interface Env {
  /** Переопределение источника — для тестовых развёртываний. */
  RETREATS_URL?: string;
  /** Ключ к закрытому фиду — то же значение, что BOT_FEED_TOKEN у сайта. */
  RETREATS_TOKEN?: string;
}

const DEFAULT_URL = "https://himalayanholytemple.net/api/retreats.json";

/** Совпадает с max-age эндпоинта: чаще спрашивать нечего. */
const CACHE_TTL_SECONDS = 300;

interface SiteRetreat {
  id?: string;
  format?: string;
  startDate?: string;
  endDate?: string;
  datesRu?: string;
  datesEn?: string;
  durationDays?: number | null;
  capacity?: number | null;
  spotsLeft?: number;
  status?: string;
  priceUsd?: number | null;
  bookable?: boolean;
}

interface SitePayload {
  next?: Record<string, string | null>;
  formats?: Record<string, { priceNoteRu?: string; priceNoteEn?: string }>;
  retreats?: SiteRetreat[];
}

const UNKNOWN = { known: false as const };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Ближайший записываемый поток.
 *
 * Берётся строго через `next` — перебирать `retreats[]` нельзя: правило
 * «ближайший» живёт на сайте, чтобы сайт, бот и приложение не разошлись.
 * `next.any === null` означает «объявим позже», а не «возьми последний».
 *
 * Записываемость при этом перепроверяется по фактам: эндпоинт может снова
 * начать отдаваться статическим файлом, и тогда его `bookable` запечён в
 * момент сборки. Явное `bookable: false` уважается — сайт может знать
 * причину, которой в фактах не видно.
 */
function pickNext(payload: SitePayload): SiteRetreat | null {
  const id = payload.next?.any;
  if (!id) return null;
  const r = (payload.retreats ?? []).find((x) => x.id === id);
  if (!r) return null;
  const fresh =
    r.status === "open" &&
    (r.spotsLeft ?? 0) > 0 &&
    String(r.startDate ?? "") > today();
  if (!fresh || r.bookable === false) return null;
  return r;
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const token = (env.RETREATS_TOKEN ?? "").trim();
  const headers: Record<string, string> = {
    "User-Agent": "himalayan-retreat-app",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit = { headers };
  // Закрытый фид сайт отдаёт как private — в общий edge-кэш такой ответ класть
  // нельзя: cacheEverything кэширует по URL, без заголовка в ключе, и копию
  // получил бы кто угодно без ключа. Открытый фид кэшируем как раньше.
  if (!token) {
    init.cf = { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true };
  }

  let payload: SitePayload;
  try {
    const res = await fetch(env.RETREATS_URL ?? DEFAULT_URL, init);
    if (!res.ok) {
      // 401 значит «ключ не принят», а не «сайт лежит». Без этой строки
      // причину пришлось бы искать в двух проектах Pages. Ключ не логировать.
      if (res.status === 401) {
        console.warn(
          token
            ? "retreat feed: 401 — ключ не принят сайтом"
            : "retreat feed: 401 — фид закрыт, а RETREATS_TOKEN не задан",
        );
      }
      return json(UNKNOWN, { headers: cacheHeader() });
    }
    payload = (await res.json()) as SitePayload;
  } catch {
    return json(UNKNOWN, { headers: cacheHeader() });
  }

  const r = pickNext(payload);
  if (!r) return json(UNKNOWN, { headers: cacheHeader() });

  const fmt = payload.formats?.[String(r.format ?? "")] ?? {};
  const price = typeof r.priceUsd === "number" && r.priceUsd > 0 ? r.priceUsd : null;

  return json(
    {
      known: true as const,
      id: r.id ?? "",
      format: r.format ?? "",
      startDate: r.startDate ?? "",
      endDate: r.endDate ?? "",
      dates: { ru: r.datesRu ?? "", en: r.datesEn ?? "" },
      durationDays: r.durationDays ?? null,
      capacity: r.capacity ?? null,
      spotsLeft: r.spotsLeft ?? 0,
      // null — «цена по запросу», а не «бесплатно». Интерфейс обязан
      // показывать такой поток без цифры, а не с нулём.
      priceUsd: price,
      priceNote: { ru: fmt.priceNoteRu ?? "", en: fmt.priceNoteEn ?? "" },
      // Принадлежит ли распорядок по дням, который лежит в приложении, именно
      // этому потоку. Если нет — выдавать его за программу предстоящего
      // ретрита нельзя: форматы различаются и по длительности, и по составу.
      programmeMatches: scheduleRetreatId === r.id,
    },
    { headers: cacheHeader() },
  );
};

/** Ответ можно кэшировать недолго, но не держать: поток закрывается набором. */
function cacheHeader(): HeadersInit {
  return { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` };
}
