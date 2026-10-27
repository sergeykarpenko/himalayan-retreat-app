import { json, methodNotAllowed } from "../_lib/http";

/**
 * GET /api/retreat — даты, пол, места, условия и программа ближайшего потока.
 *
 * Источник — сайт: https://himalayanholytemple.net/api/retreats.json, который
 * собирается из site-config.json. Приложение держит эти данные НЕ у себя
 * нарочно: до 04.10.2026 дата ближайшего потока была вшита в трёх местах
 * (src/data/schedule.ts, src/lib/retreatCountdown.ts и распорядок по дням) и
 * разъехалась с сайтом — приложение показывало «Следующий ретрит: 23 сентября
 * — 1 октября 2026» уже после того, как этот поток закончился. Своего
 * распорядка по дням у приложения с 27.10.2026 тоже нет — см. ПРОГРАММА.
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
 * ОПРОС — РАЗ В 5 МИНУТ, как у бота. Фид читается не на каждый запрос
 * страницы: принятый ответ живёт в памяти изолята, как `_cache` у бота, и
 * обновляется, когда стареет больше TTL (RETREATS_TTL_SECONDS, по умолчанию
 * 300 — ровно TTL бота). Это потолок, а не гарантия «один запрос в 5 минут»:
 * изолятов у Pages много и живут они недолго, так что сайт увидит примерно по
 * запросу в 5 минут на изолят, а не один на весь мир.
 *
 * Срок доверия — 6 часов (RETREATS_MAX_AGE_SECONDS), тоже как у бота: пока
 * сайт не отвечает, последний принятый фид продолжает работать, и короткая
 * недоступность не убирает даты у всех. Данные старше этого срока не
 * используются вовсе.
 *
 * ЦЕНЫ ЗДЕСЬ НЕТ, и это решение сайта (08.10.2026): стоимость называют
 * только на созвоне, цифры нет ни на страницах, ни в фиде. Вместо неё фид
 * отдаёт готовую фразу (pricePublicRu/En), и приложение показывает её
 * дословно. Своей формулировки о деньгах у приложения быть не должно: она
 * разойдётся с сайтом при первой же правке условий.
 *
 * ПРОГРАММА — ТОЖЕ СЛОВАМИ САЙТА. До 27.10.2026 в приложении лежал свой
 * распорядок на девять дней: заголовки, описания, «First Ceremony — Full
 * Moon» на четвёртый день. Сайт такого не публикует — у него на формат одна
 * строка structureRu/En, — а написан тот распорядок был под сентябрьский
 * поток и продолжал показываться, когда ближайшим стал ноябрьский. Поэтому
 * здесь отдаётся структура формата ТОГО потока, который сайт объявил
 * ближайшим, и теми словами, что стоят в фиде. Своей программы у приложения
 * быть не должно: участник прочитает её как обещание.
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
  /** Как часто спрашивать сайт, в секундах. По умолчанию 300 — как у бота. */
  RETREATS_TTL_SECONDS?: string;
  /** Сколько верить последнему ответу, если сайт молчит. По умолчанию 6 часов. */
  RETREATS_MAX_AGE_SECONDS?: string;
}

const DEFAULT_URL = "https://himalayanholytemple.net/api/retreats.json";

/** Раз в 5 минут: совпадает с HDT_RETREATS_TTL бота. */
const DEFAULT_TTL_SECONDS = 300;

/**
 * Жёсткий потолок достоверности: данные старше — «неизвестно», а не «пусть
 * будет хоть что-то». Шесть часов — то же, что HDT_RETREATS_MAX_AGE у бота:
 * сутки по памяти даты называть нельзя, а пережить получасовую недоступность
 * сайта надо. Даты, места и записываемость при этом перепроверяются на каждом
 * запросе, так что закончившийся поток из памяти не вылезет.
 */
const DEFAULT_MAX_AGE_SECONDS = 6 * 3600;

/** Границы разумного: минута — нижний предел, неделя — верхний. */
const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 7 * 86_400;

/** Сколько держать НАШ ответ у клиента: он дешёвый, но поток закрывается набором. */
const CACHE_TTL_SECONDS = 300;

function seconds(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt((raw ?? "").trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, MIN_TTL_SECONDS), MAX_TTL_SECONDS);
}

function feedTtlSeconds(env: Env): number {
  return seconds(env.RETREATS_TTL_SECONDS, DEFAULT_TTL_SECONDS);
}

/** Верить последнему ответу меньше, чем длится сам опрос, бессмысленно. */
function feedMaxAgeSeconds(env: Env, ttlSeconds: number): number {
  return Math.max(
    seconds(env.RETREATS_MAX_AGE_SECONDS, DEFAULT_MAX_AGE_SECONDS),
    ttlSeconds,
  );
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
  /** "women" | "men" | "" — пустое значит смешанный поток. */
  audience?: string;
  bookable?: boolean;
}

/**
 * Формат потока так, как его публикует сайт: одна строка структуры по дням
 * и числа. Ключ в `formats` — то же значение, что в retreats[].format.
 */
interface SiteFormat {
  structureRu?: string;
  structureEn?: string;
  ceremonies?: number;
  microdosingSessions?: number;
  groupSize?: number | null;
}

interface SitePayload {
  next?: Record<string, string | null>;
  formats?: Record<string, SiteFormat>;
  /** Что сайт разрешает сказать о стоимости. Цифры в фиде больше нет. */
  pricePublicRu?: string;
  pricePublicEn?: string;
  retreats?: SiteRetreat[];
}

/**
 * Пол потока показываем только из известных значений.
 *
 * Сайт заводит новые поля раньше, чем приложение о них узнаёт. Вывести в
 * интерфейс незнакомую строку из фида значит показать человеку внутренний код
 * вместо слова — лучше промолчать, как сайт молчит про смешанный поток.
 */
const AUDIENCES = new Set(["women", "men"]);

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

/** Принятый фид, если сайт не ответил и он ещё в пределах срока доверия. */
function staleFeed(now: number, maxAgeSeconds: number): SitePayload | null {
  if (!feed) return null;
  return now - feed.at < maxAgeSeconds * 1000 ? feed.payload : null;
}

async function readFeed(env: Env): Promise<SitePayload | null> {
  const ttlSeconds = feedTtlSeconds(env);
  const maxAgeSeconds = feedMaxAgeSeconds(env, ttlSeconds);
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
      return staleFeed(now, maxAgeSeconds);
    }
    const payload = (await res.json()) as SitePayload;
    feed = { at: now, payload };
    return payload;
  } catch {
    return staleFeed(now, maxAgeSeconds);
  }
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const payload = await readFeed(env);
  if (!payload) return json(UNKNOWN, { headers: cacheHeader() });

  const r = pickNext(payload);
  if (!r) return json(UNKNOWN, { headers: cacheHeader() });

  const audience = String(r.audience ?? "");
  // Структура — по формату ИМЕННО ЭТОГО потока: у церемониального и у кэмпа
  // разные и длительность, и состав. Нет формата в фиде — нет и программы.
  const fmt = payload.formats?.[String(r.format ?? "")] ?? {};

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
      // Пол потока: сайт приписывает его к дате — «16–24 ноября 2026,
      // мужской поток». Без этого женщина читает мужской поток как свой.
      audience: AUDIENCES.has(audience) ? audience : "",
      // Фраза о стоимости целиком с сайта. Своей у приложения быть не может:
      // цену называют на созвоне, и что именно обещать — решает сайт.
      pricePublic: {
        ru: payload.pricePublicRu ?? "",
        en: payload.pricePublicEn ?? "",
      },
      // Программа — одной строкой с сайта (structureRu/En формата) плюс его
      // же числа. Своего распорядка по дням у приложения нет: см. ПРОГРАММА
      // в шапке файла.
      programme: {
        structure: { ru: fmt.structureRu ?? "", en: fmt.structureEn ?? "" },
        ceremonies: fmt.ceremonies ?? null,
        microdosingSessions: fmt.microdosingSessions ?? null,
        groupSize: fmt.groupSize ?? null,
      },
    },
    { headers: cacheHeader() },
  );
};

/** Ответ можно кэшировать недолго, но не держать: поток закрывается набором. */
function cacheHeader(): HeadersInit {
  return { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` };
}
