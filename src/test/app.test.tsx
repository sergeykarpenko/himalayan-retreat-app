import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";

import { teachers } from "@/data/about";
import { guideSections } from "@/data/guide";
import { meditations, attunements } from "@/data/meditations";
import { testimonials } from "@/data/testimonials";

import { BottomNav } from "@/components/layout/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { SchedulePage } from "@/pages/SchedulePage";
import { MeditationsPage } from "@/pages/MeditationsPage";
import { GuidePage } from "@/pages/GuidePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { TestimonialsPage } from "@/pages/TestimonialsPage";
import { Header } from "@/components/layout/Header";

function mockAuthenticatedSession(paid = false) {
  vi.mocked(fetch).mockImplementation((input) => {
    const url = String(input);
    const headers = { "Content-Type": "application/json" };
    if (url.includes("/api/guide")) {
      const sections = paid ? guideSections : guideSections.slice(0, 3);
      return Promise.resolve(new Response(JSON.stringify({ sections }), { status: 200, headers }));
    }
    return Promise.resolve(new Response(
      JSON.stringify({
        user: {
          id: 1,
          first_name: "Test",
          auth_date: Math.floor(Date.now() / 1000),
          paid,
        },
      }),
      {
        status: 200,
        headers,
      },
    ));
  });
}

// ── Data integrity ──────────────────────────────────────────────

describe("Data integrity", () => {
  test("all teachers have non-empty bios in both languages", () => {
    for (const t of teachers) {
      expect(t.bio.en.length).toBeGreaterThan(0);
      expect(t.bio.ru.length).toBeGreaterThan(0);
    }
  });

  test("all guide sections have >= 2 items", () => {
    for (const section of guideSections) {
      expect(section.items.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("all meditation tracks have id, duration, bilingual title", () => {
    for (const track of meditations) {
      expect(track.id).toBeTruthy();
      expect(track.duration).toBeTruthy();
      expect(track.title.en).toBeTruthy();
      expect(track.title.ru).toBeTruthy();
    }
  });
});

// ── BottomNav ───────────────────────────────────────────────────

describe("BottomNav", () => {
  test("renders 5 navigation links", () => {
    renderWithProviders(<BottomNav />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  test("links to correct paths", () => {
    renderWithProviders(<BottomNav />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(["/", "/schedule", "/meditations", "/guide", "/about"]);
  });

  test("shows English labels by default", () => {
    localStorage.removeItem("language");
    renderWithProviders(<BottomNav />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Meditate")).toBeInTheDocument();
    expect(screen.getByText("Guide")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});

// ── Page rendering - EN ─────────────────────────────────────────

describe("Page rendering - EN", () => {
  beforeEach(() => localStorage.removeItem("language"));

  test("HomePage: heading + 6 quick links + booking CTA + install banner + sign-in link", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Himalayan Retreat")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(9);
  });

  test("HomePage: даты ближайшего потока вшитыми в страницу НЕ показываются", () => {
    // Источник дат — сайт, через /api/retreat. Без ответа страница говорит
    // «даты уточняются». Раньше здесь висела константа сентябрьского потока,
    // и в октябре приложение звало на уже закончившийся ретрит.
    renderWithProviders(<HomePage />);
    expect(screen.queryByText(/September 23/)).not.toBeInTheDocument();
    expect(screen.queryByText(/23 сентября/)).not.toBeInTheDocument();
  });

  test("SchedulePage: без ответа сайта программы нет", async () => {
    renderWithProviders(<SchedulePage />);
    expect(await screen.findByText("Dates to be announced")).toBeInTheDocument();
  });

  test("MeditationsPage: all tracks rendered (logged in)", () => {
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
    renderWithProviders(<MeditationsPage />);
    for (const track of meditations) {
      expect(screen.getByText(track.title.en)).toBeInTheDocument();
    }
    localStorage.removeItem("tg_user");
  });

  test("GuidePage: all 6 sections", () => {
    renderWithProviders(<GuidePage />);
    for (const section of guideSections) {
      expect(screen.getByText(section.title.en)).toBeInTheDocument();
    }
  });

  test("AboutPage: all teachers", () => {
    renderWithProviders(<AboutPage />);
    for (const t of teachers) {
      expect(screen.getByText(t.name.en)).toBeInTheDocument();
    }
  });

  test("ContactPage: 5 contact options", () => {
    renderWithProviders(<ContactPage />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  test("TestimonialsPage: first 2 visible, rest locked for guests", () => {
    renderWithProviders(<TestimonialsPage />);
    expect(testimonials).toHaveLength(4);
    // All names visible (locked ones show name too)
    for (const item of testimonials) {
      expect(screen.getByText(item.name.en)).toBeInTheDocument();
    }
    // 2 clickable testimonial links + 1 sign-in link for guests
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  test("TestimonialsPage: all visible for logged-in user", () => {
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
    renderWithProviders(<TestimonialsPage />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    localStorage.removeItem("tg_user");
  });
});

// ── Page rendering - RU ─────────────────────────────────────────

describe("Page rendering - RU", () => {
  beforeEach(() => localStorage.setItem("language", "ru"));
  afterEach(() => localStorage.removeItem("language"));

  test("HomePage: Russian heading", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Гималайский Ретрит")).toBeInTheDocument();
  });

  test("AboutPage: Russian teacher names", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText("Сергий")).toBeInTheDocument();
    expect(screen.getByText("Елена")).toBeInTheDocument();
    expect(screen.getByText("Олеся")).toBeInTheDocument();
  });
});

// ── Language switching ──────────────────────────────────────────

describe("Language switching", () => {
  beforeEach(() => localStorage.removeItem("language"));

  test("Header toggle EN -> RU", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Header />
        <HomePage />
      </>
    );
    const toggle = screen.getByRole("button", { name: "RU" });
    await user.click(toggle);
    expect(screen.getByText("Гималайский Ретрит")).toBeInTheDocument();
  });

  test("BottomNav labels change with language", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Header />
        <BottomNav />
      </>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "RU" });
    await user.click(toggle);
    expect(screen.getByText("Главная")).toBeInTheDocument();
  });
});

// ── Обновление данных о потоке ───────────────────────────────────

/**
 * Приложение живёт как PWA: вкладку не перезагружают неделями. Без обновления
 * на экране навсегда остались бы данные того момента, когда её открыли. Срок
 * тот же, что у серверной части и у бота.
 */
describe("Данные о потоке: обновление раз в 5 минут", () => {
  const REFRESH = 300_000;

  const upcoming = {
    known: true,
    id: "october-2026",
    format: "ceremonial",
    startDate: "2099-10-23",
    endDate: "2099-11-01",
    dates: { ru: "23 октября – 1 ноября", en: "October 23 – November 1" },
    durationDays: 9,
    capacity: 4,
    spotsLeft: 4,
    audience: "women",
    pricePublic: { ru: "", en: "" },
    programme: {
      structure: { ru: "День 1 — заезд.", en: "Day 1 — arrival." },
      ceremonies: 4,
      microdosingSessions: 5,
      groupSize: 4,
    },
  };

  function mockFeed(answer: () => Promise<Response>) {
    vi.mocked(fetch).mockImplementation((input) => {
      const headers = { "Content-Type": "application/json" };
      if (String(input).includes("/api/retreat")) return answer();
      return Promise.resolve(
        new Response(JSON.stringify({ user: null }), { status: 401, headers }),
      );
    });
  }

  function feedCalls() {
    return vi
      .mocked(fetch)
      .mock.calls.filter((c) => String(c[0]).includes("/api/retreat")).length;
  }

  beforeEach(() => localStorage.removeItem("language"));

  test("пол потока и фраза о стоимости — словами сайта", async () => {
    // Сайт говорит «November 16–24, 2026, men's group» и называет цену только
    // на созвоне. До 27.10.2026 приложение молчало и про то, и про другое:
    // женщина читала мужской поток как свой.
    mockFeed(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            ...upcoming,
            audience: "men",
            pricePublic: {
              ru: "Стоимость обсуждаем на созвоне.",
              en: "We discuss the cost on a call.",
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    renderWithProviders(<HomePage />);
    expect(
      await screen.findByText("October 23 – November 1, men's group"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("We discuss the cost on a call."),
    ).toBeInTheDocument();
  });

  test("через пять минут при возврате к приложению данные перечитываются", async () => {
    mockFeed(() =>
      Promise.resolve(
        new Response(JSON.stringify(upcoming), {
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const base = Date.now();
    renderWithProviders(<HomePage />);
    expect(await screen.findByText("October 23 – November 1, women's group")).toBeInTheDocument();
    expect(feedCalls()).toBe(1);

    // Переключение окна сразу же запросов не плодит.
    document.dispatchEvent(new Event("visibilitychange"));
    expect(feedCalls()).toBe(1);

    vi.spyOn(Date, "now").mockReturnValue(base + REFRESH + 60_000);
    document.dispatchEvent(new Event("visibilitychange"));
    await waitFor(() => expect(feedCalls()).toBe(2));
  });

  test("неудачное обновление не стирает показанные даты", async () => {
    let first = true;
    mockFeed(() => {
      if (first) {
        first = false;
        return Promise.resolve(
          new Response(JSON.stringify(upcoming), {
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return Promise.reject(new Error("network down"));
    });
    const base = Date.now();
    renderWithProviders(<HomePage />);
    expect(await screen.findByText("October 23 – November 1, women's group")).toBeInTheDocument();

    vi.spyOn(Date, "now").mockReturnValue(base + REFRESH + 60_000);
    document.dispatchEvent(new Event("visibilitychange"));

    await waitFor(() => expect(feedCalls()).toBe(2));
    // Сеть моргнула — это не повод убирать даты с открытой страницы.
    expect(screen.getByText("October 23 – November 1, women's group")).toBeInTheDocument();
    expect(screen.queryByText("Dates to be announced")).not.toBeInTheDocument();
  });
});

// ── Программа: словами сайта ────────────────────────────────────

/**
 * Своего распорядка по дням у приложения нет. Сайт публикует на формат одну
 * строку (structureRu/En) — её и показываем, дословно. До 27.10.2026 здесь
 * лежали девять дней, написанные под сентябрьский поток, и страница продолжала
 * показывать их, когда ближайшим сайт объявил ноябрьский.
 */
describe("SchedulePage: программа словами сайта", () => {
  const upcoming = {
    known: true,
    id: "november-2026",
    format: "ceremonial",
    startDate: "2026-11-16",
    endDate: "2026-11-24",
    dates: { ru: "16–24 ноября 2026", en: "November 16–24, 2026" },
    durationDays: 9,
    capacity: 4,
    spotsLeft: 1,
    audience: "men",
    pricePublic: { ru: "", en: "" },
    programme: {
      structure: {
        ru: "День 1 — заезд, заселение, интеграционный круг. День 9 — завершение и отъезд.",
        en: "Day 1 — arrival, check-in, integration circle. Day 9 — completion and departure.",
      },
      ceremonies: 4,
      microdosingSessions: 5,
      groupSize: 4,
    },
  };

  function mockRetreat(retreat: Record<string, unknown> | null) {
    vi.mocked(fetch).mockImplementation((input) => {
      const headers = { "Content-Type": "application/json" };
      if (String(input).includes("/api/retreat")) {
        return Promise.resolve(
          new Response(JSON.stringify(retreat ?? { known: false }), { headers }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ user: null }), { status: 401, headers }),
      );
    });
  }

  beforeEach(() => localStorage.removeItem("language"));
  afterEach(() => localStorage.removeItem("language"));

  test("структура формата показана дословно и подписана тем же потоком", async () => {
    mockRetreat(upcoming);
    renderWithProviders(<SchedulePage />);
    expect(
      await screen.findByText(
        "Day 1 — arrival, check-in, integration circle. Day 9 — completion and departure.",
      ),
    ).toBeInTheDocument();
    // Пол потока приписан к дате, как на сайте: иначе женщина читает мужской
    // поток как свой.
    expect(
      screen.getByText(
        "Programme of the November 16–24, 2026, men's group retreat.",
      ),
    ).toBeInTheDocument();
  });

  test("по-русски — русская строка сайта", async () => {
    localStorage.setItem("language", "ru");
    mockRetreat(upcoming);
    renderWithProviders(<SchedulePage />);
    expect(
      await screen.findByText(
        "День 1 — заезд, заселение, интеграционный круг. День 9 — завершение и отъезд.",
      ),
    ).toBeInTheDocument();
  });

  test("числа формата — тоже с сайта", async () => {
    mockRetreat(upcoming);
    renderWithProviders(<SchedulePage />);
    expect(await screen.findByText("9 days")).toBeInTheDocument();
    expect(screen.getByText("Ceremonies")).toBeInTheDocument();
    expect(screen.getByText("Microdosing sessions")).toBeInTheDocument();
    expect(screen.getByText("up to 4")).toBeInTheDocument();
  });

  test("ноль и пустое не показываем: это утверждение, которого сайт не делал", async () => {
    mockRetreat({
      ...upcoming,
      programme: {
        ...upcoming.programme,
        ceremonies: 0,
        microdosingSessions: 0,
        groupSize: null,
      },
    });
    renderWithProviders(<SchedulePage />);
    await screen.findByText(/Day 1 — arrival/);
    expect(screen.queryByText("Ceremonies")).not.toBeInTheDocument();
    expect(screen.queryByText("Microdosing sessions")).not.toBeInTheDocument();
    expect(screen.queryByText("Group")).not.toBeInTheDocument();
  });

  test("сайт не дал структуру — приложение не досочиняет", async () => {
    mockRetreat({
      ...upcoming,
      programme: { ...upcoming.programme, structure: { ru: "", en: "" } },
    });
    renderWithProviders(<SchedulePage />);
    expect(
      await screen.findByText("The programme has not been published yet."),
    ).toBeInTheDocument();
  });

  test("нет ответа с сайта — ни дат, ни программы", async () => {
    mockRetreat(null);
    renderWithProviders(<SchedulePage />);
    expect(await screen.findByText("Dates to be announced")).toBeInTheDocument();
    // Сентябрьского распорядка, который висел здесь до 27.10.2026, больше нет.
    expect(screen.queryByText(/First Ceremony/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Day 1/)).not.toBeInTheDocument();
  });
});

// ── Guide accordion ─────────────────────────────────────────────

describe("Guide accordion", () => {
  beforeEach(() => localStorage.removeItem("language"));
  afterEach(() => localStorage.removeItem("tg_user"));

  test("packing open by default with items visible", async () => {
    renderWithProviders(<GuidePage />);
    expect(
      await screen.findByText("Comfortable loose clothing for meditation and yoga")
    ).toBeInTheDocument();
  });

  test("guest: diet section is locked, shows clickable sign-in", () => {
    renderWithProviders(<GuidePage />);
    expect(
      screen.queryByText("Vegetarian meals are provided throughout the retreat")
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("telegram-login-inline").length).toBeGreaterThan(0);
  });

  test("logged-in: click diet -> diet opens, packing closes", async () => {
    mockAuthenticatedSession();
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    expect(await screen.findByText("Comfortable loose clothing for meditation and yoga")).toBeInTheDocument();

    await user.click(screen.getByText("Diet & Nutrition"));

    expect(
      screen.getByText("Vegetarian meals are provided throughout the retreat")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Comfortable loose clothing for meditation and yoga")
    ).not.toBeInTheDocument();
  });
});

// ── Audio playback ──────────────────────────────────────────────

describe("Audio playback", () => {
  interface MockAudioInstance {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    paused: boolean;
    onended: (() => void) | null;
    src: string;
  }

  let mockAudios: MockAudioInstance[];
  let originalAudio: typeof Audio;

  beforeEach(() => {
    mockAudios = [];
    originalAudio = globalThis.Audio;
    globalThis.Audio = function MockAudio(this: MockAudioInstance, src?: string) {
      this.play = vi.fn().mockResolvedValue(undefined);
      this.pause = vi.fn();
      this.paused = true;
      this.onended = null;
      this.src = src || "";
      mockAudios.push(this);
      return this;
    } as unknown as typeof Audio;
    // Stub caches API to avoid errors
    if (!globalThis.caches) {
      Object.defineProperty(globalThis, "caches", {
        configurable: true,
        value: {
          open: vi.fn().mockResolvedValue({
            match: vi.fn().mockResolvedValue(null),
          }),
        } as unknown as CacheStorage,
      });
    }
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
    mockAuthenticatedSession();
  });

  test("official team portraits are configured", () => {
    expect(teachers.find((teacher) => teacher.name.en === "Sergiy")?.photo?.src).toBe(
      "/team/serhii-karpenko.webp",
    );
    expect(teachers.find((teacher) => teacher.name.en === "Elena")?.photo?.src).toBe(
      "/team/olena-ruta.webp",
    );
    expect(teachers.find((teacher) => teacher.name.en === "Olesya")?.photo?.src).toBe(
      "/team/olesya-dembitskaya.webp",
    );
    expect(
      teachers.find((teacher) => teacher.name.en === "Yulia Gorodnichaya")
        ?.photo?.src,
    ).toBe("/team/nepal-school-apprentice.webp");
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
    localStorage.removeItem("tg_user");
  });

  test("only one track plays at a time", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeditationsPage />);

    // Click first play button (track A)
    const firstTrackTitle = attunements[0].title.en;
    const secondTrackTitle = attunements[1].title.en;

    // Find play buttons by proximity to track titles
    const trackAContainer = screen.getByText(firstTrackTitle).closest("div.flex");
    const trackBContainer = screen.getByText(secondTrackTitle).closest("div.flex");

    const buttonA = trackAContainer!.querySelector("button")!;
    const buttonB = trackBContainer!.querySelector("button")!;

    await user.click(buttonA);
    expect(mockAudios).toHaveLength(1);
    expect(mockAudios[0].play).toHaveBeenCalled();

    await user.click(buttonB);
    expect(mockAudios).toHaveLength(2);
    expect(mockAudios[1].play).toHaveBeenCalled();
    // Track A should have been paused
    expect(mockAudios[0].pause).toHaveBeenCalled();
  });

  test("audio stops on unmount", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<MeditationsPage />);

    const firstTrackTitle = attunements[0].title.en;
    const trackAContainer = screen.getByText(firstTrackTitle).closest("div.flex");
    const buttonA = trackAContainer!.querySelector("button")!;

    await user.click(buttonA);
    expect(mockAudios).toHaveLength(1);
    expect(mockAudios[0].play).toHaveBeenCalled();

    unmount();
    expect(mockAudios[0].pause).toHaveBeenCalled();
  });
});
