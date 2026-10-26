import { onRequest } from "../../functions/api/retreat";
import {
  getApproachIntensity,
  getDaysUntilRetreat,
  parseRetreatStart,
} from "@/lib/retreatCountdown";
import { scheduleRetreatId } from "@/data/schedule";

/**
 * Даты, места и цена ближайшего потока приходят с сайта.
 *
 * Главное, что проверяется: политика FAIL-CLOSED. До 04.10.2026 дата была
 * вшита в приложение в трёх местах и показывала закончившийся сентябрьский
 * поток как предстоящий. Теперь при любом сомнении приложение не называет
 * никаких дат — молчание допустимо, устаревший поток нет.
 */

const FUTURE = "2099-10-23";
const PAST = "2020-06-15";

function sitePayload(over: Record<string, unknown> = {}) {
  return {
    next: { camp: null, ceremonial: "soon", any: "soon" },
    formats: {
      ceremonial: { priceNoteRu: "за программу", priceNoteEn: "per program" },
    },
    retreats: [
      {
        id: "soon",
        format: "ceremonial",
        startDate: FUTURE,
        endDate: "2099-11-01",
        datesRu: "23 октября – 1 ноября",
        datesEn: "October 23 – November 1",
        durationDays: 9,
        capacity: 4,
        spotsLeft: 4,
        status: "open",
        priceUsd: 9500,
        bookable: true,
      },
    ],
    ...over,
  };
}

function call(body: unknown, status = 200, env: Record<string, string> = {}) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  );
  return onRequest({
    request: new Request("https://app.example/api/retreat"),
    env,
  } as never);
}

/** Что именно ушло на сайт последним запросом. */
function lastRequest() {
  const [url, init] = vi.mocked(fetch).mock.calls.at(-1) as [
    string,
    RequestInit & { cf?: unknown },
  ];
  return { url, init, headers: (init.headers ?? {}) as Record<string, string> };
}

describe("/api/retreat", () => {
  test("отдаёт даты, места и цену ближайшего потока", async () => {
    const res = await call(sitePayload());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.known).toBe(true);
    expect(data.dates).toEqual({
      ru: "23 октября – 1 ноября",
      en: "October 23 – November 1",
    });
    expect(data.spotsLeft).toBe(4);
    expect(data.priceUsd).toBe(9500);
    expect(data.priceNote.ru).toBe("за программу");
  });

  test("кэшируется недолго: поток закрывается набором", async () => {
    const res = await call(sitePayload());
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");
  });

  test("говорит, что распорядок в приложении — от другого потока", async () => {
    const res = await call(sitePayload());
    const data = await res.json();
    // В приложении лежит программа september-2026, а поток другой: выдавать
    // её за программу предстоящего ретрита нельзя.
    expect(scheduleRetreatId).toBe("september-2026");
    expect(data.programmeMatches).toBe(false);
  });

  test("отсутствие цены — null, а не ноль", async () => {
    const p = sitePayload();
    p.retreats[0].priceUsd = null;
    const data = await (await call(p)).json();
    expect(data.known).toBe(true);
    expect(data.priceUsd).toBeNull();
    expect(data.dates.ru).toBe("23 октября – 1 ноября");
  });
});

describe("/api/retreat: ключ к фиду", () => {
  test("с ключом запрос уходит с Authorization: Bearer", async () => {
    const res = await call(sitePayload(), 200, { RETREATS_TOKEN: "s3cret" });
    expect((await res.json()).known).toBe(true);
    expect(lastRequest().headers.Authorization).toBe("Bearer s3cret");
  });

  test("пробелы вокруг ключа не уезжают в заголовок", async () => {
    await call(sitePayload(), 200, { RETREATS_TOKEN: "  s3cret\n" });
    expect(lastRequest().headers.Authorization).toBe("Bearer s3cret");
  });

  test("без ключа заголовка нет: открытый фид работает как раньше", async () => {
    await call(sitePayload());
    const { headers, init } = lastRequest();
    expect(headers.Authorization).toBeUndefined();
    // Открытый ответ публичный, его и кэшируем.
    expect(init.cf).toEqual({ cacheTtl: 300, cacheEverything: true });
  });

  test("ответ по ключу не кладётся в общий edge-кэш", async () => {
    // Сайт отдаёт закрытый фид как private, а cacheEverything кэширует по URL,
    // без заголовка в ключе: копию получил бы кто угодно без ключа.
    await call(sitePayload(), 200, { RETREATS_TOKEN: "s3cret" });
    expect(lastRequest().init.cf).toBeUndefined();
  });

  test("пустой ключ в секрете — это «ключа нет», а не пустой Bearer", async () => {
    await call(sitePayload(), 200, { RETREATS_TOKEN: "   " });
    expect(lastRequest().headers.Authorization).toBeUndefined();
  });

  test("401 от сайта → дат нет", async () => {
    const res = await call({ error: "unauthorized" }, 401, {
      RETREATS_TOKEN: "wrong",
    });
    expect(await res.json()).toEqual({ known: false });
  });
});

describe("/api/retreat: fail-closed", () => {
  test("сайт недоступен → дат нет", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));
    const res = await onRequest({
      request: new Request("https://app.example/api/retreat"),
      env: {},
    } as never);
    expect(await res.json()).toEqual({ known: false });
  });

  test("сайт ответил ошибкой → дат нет", async () => {
    expect(await (await call({}, 503)).json()).toEqual({ known: false });
  });

  test("next.any == null означает «объявим позже», а не «возьми последний»", async () => {
    const data = await (
      await call(sitePayload({ next: { camp: null, ceremonial: null, any: null } }))
    ).json();
    expect(data).toEqual({ known: false });
  });

  test("прошедший поток не отдаётся, даже если сайт считает его записываемым", async () => {
    const p = sitePayload();
    p.retreats[0].startDate = PAST;
    p.retreats[0].endDate = "2020-06-25";
    expect(await (await call(p)).json()).toEqual({ known: false });
  });

  test("распроданный поток не отдаётся", async () => {
    const p = sitePayload();
    p.retreats[0].spotsLeft = 0;
    expect(await (await call(p)).json()).toEqual({ known: false });
  });

  test("явное bookable: false уважается", async () => {
    const p = sitePayload();
    p.retreats[0].bookable = false;
    expect(await (await call(p)).json()).toEqual({ known: false });
  });

  test("next указывает на поток, которого нет в списке", async () => {
    expect(
      await (await call(sitePayload({ next: { any: "no-such-id" } }))).json(),
    ).toEqual({ known: false });
  });

  test("ответ без поля bookable всё равно понятен", async () => {
    const p = sitePayload();
    delete (p.retreats[0] as Record<string, unknown>).bookable;
    const data = await (await call(p)).json();
    expect(data.known).toBe(true);
  });

  test("POST не принимается", async () => {
    const res = await onRequest({
      request: new Request("https://app.example/api/retreat", { method: "POST" }),
      env: {},
    } as never);
    expect(res.status).toBe(405);
  });
});

describe("обратный отсчёт", () => {
  test("дата потока разбирается по непальскому времени", () => {
    const d = parseRetreatStart("2026-10-23");
    expect(d?.toISOString()).toBe("2026-10-22T18:15:00.000Z"); // 00:00 +05:45
  });

  test("мусор вместо даты — null, а не «сегодня»", () => {
    expect(parseRetreatStart("")).toBeNull();
    expect(parseRetreatStart(null)).toBeNull();
    expect(parseRetreatStart("23.10.2026")).toBeNull();
  });

  test("без даты отсчёт не показывается вовсе", () => {
    expect(getDaysUntilRetreat(null)).toBeNull();
  });

  test("отсчёт считается от переданной даты", () => {
    const start = parseRetreatStart("2026-10-23")!;
    expect(getDaysUntilRetreat(start, new Date("2026-10-13T00:00:00Z"))).toBe(10);
    expect(getDaysUntilRetreat(start, new Date("2026-11-01T00:00:00Z"))).toBeLessThan(0);
  });

  test("без даты свечение ровное и неяркое, а не «как будто началось»", () => {
    expect(getApproachIntensity(null)).toBeCloseTo(0.35);
    const started = parseRetreatStart("2020-01-01")!;
    expect(getApproachIntensity(started)).toBe(1);
  });
});
