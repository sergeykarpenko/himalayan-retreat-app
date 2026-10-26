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
 * ОПРОС — РАЗ В СУТКИ. Фид читается не на каждый запрос страницы: принятый
 * ответ живёт в памяти изолята, как `_cache` у бота, и обновляется, когда
 * стареет больше TTL. Срок задаётся RETREATS_TTL_SECONDS, по умолчанию сутки.
 * Это потолок, а не гарантия «ровно один запрос в сутки»: изолятов у Pages
 * много и живут они недолго, так что сайт увидит примерно один запрос в сутки
 * на изолят, а не один на весь мир.
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
  /** Как часто спрашивать сайт, в секундах. По умолчанию сутки. */
  RETREATS_TTL_SECONDS?: string;
}

const DEFAULT_URL = "https://himalayanholytemple.net/api/retreats.json";

/** Раз в сутки: перечень потоков меняется редко и руками. */
const DEFAULT_TTL_SECONDS = 86_400;

/** Границы разумного: минута — нижний предел, неделя — верхний. */
const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 7 * 86_400;

/**
 * Насколько дольше TTL принятый фид ещё годится, если сайт не ответил.
 *
 * У бота та же развилка: опрос раз в 5 минут, но верить последнему ответу он
 * продолжает 6 часов. Иначе одна неудачная попытка убирала бы даты у всех до
 * следующей удачной. Даты, места и записываемость при этом перепроверяются на
 * каждом запросе, так что закончившийся поток из памяти не вылезет.
 */
const STALE_FACTOR = 2;

/** Сколько держать НАШ ответ у клиента: он дешёвый, но поток закрывается набором. */
const CACHE_TTL_SECONDS = 300;

function feedTtlSeconds(env: Env): number {
  const raw = Number.parseInt((env.RETREATS_TTL_SECONDS ?? "").trim(), 10);
  if (!Number.isFinite(raw)) return DEFAULT_TTL_SECONDS;
  return Math.min(Math.max(raw, MIN_TTL_SECONDS), MAX_TTL_SECONDS);
}

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

/**
 * Последний принятый ответ сайта — в памяти изолята, как `_cache` у бота.
 *
 * Общий edge-кэш (`cf: { cacheEverything }`) для этого не годится: он
 * кэширует по URL, без заголовка в ключе, а сайт отдаёт закрытый фид как
 * private — копию получил бы кто угодно без ключа, и ключ перестал бы что-то
 * значить. Память изолята никому не видна.
 */
let feed: { at: number; payload: SitePayload } | null = null;

/** Только для тестов: забыть принятый фид, чтобы проверки не зависели друг от друга. */
export function __resetFeedCache(): void {
  feed = null;
}

/** Принятый фид, если сайт не ответил и он ещё не слишком стар. */
function staleFeed(now: number, ttlSeconds: number): SitePayload | null {
  if (!feed) return null;
  const limit = ttlSeconds * STALE_FACTOR * 1000;
  return now - feed.at < limit ? feed.payload : null;
}

async function readFeed(env: Env, ttlSeconds: number): Promise<SitePayload | null> {
  const now = Date.now();
  if (feed && now - feed.at < ttlSeconds * 1000) return feed.payload;

  const token = (env.RETREATS_TOKEN ?? "").trim();
  const headers: Record<string, string> = {
    "User-Agent": "himalayan-retreat-app",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(env.RETREATS_URL ?? DEFAULT_URL, { headers });
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
      return staleFeed(now, ttlSeconds);
    }
    const payload = (await res.json()) as SitePayload;
    feed = { at: now, payload };
    return payload;
  } catch {
    return staleFeed(now, ttlSeconds);
  }
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const payload = await readFeed(env, feedTtlSeconds(env));
  if (!payload) return json(UNKNOWN, { headers: cacheHeader() });

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
