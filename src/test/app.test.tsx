import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";

import { schedule } from "@/data/schedule";
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

// ── Data integrity ──────────────────────────────────────────────

describe("Data integrity", () => {
  test("every schedule group has >= 3 items", () => {
    for (const day of schedule) {
      expect(day.items.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("every schedule item has EN+RU titles", () => {
    for (const day of schedule) {
      for (const item of day.items) {
        expect(item.title.en).toBeTruthy();
        expect(item.title.ru).toBeTruthy();
      }
    }
  });

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

  test("HomePage: heading + 6 quick links + booking CTA", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Himalayan Retreat")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(7);
  });

  test("SchedulePage: Day 1 active by default", () => {
    renderWithProviders(<SchedulePage />);
    expect(screen.getByText("Arrival & Opening")).toBeInTheDocument();
    expect(screen.getByText("Welcome Circle")).toBeInTheDocument();
  });

  test("SchedulePage: shows 5 tabs for 11-day retreat", () => {
    renderWithProviders(<SchedulePage />);
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Days 2–5")).toBeInTheDocument();
    expect(screen.getByText("Day 6")).toBeInTheDocument();
    expect(screen.getByText("Days 7–10")).toBeInTheDocument();
    expect(screen.getByText("Day 11")).toBeInTheDocument();
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

  test("AboutPage: all 3 teachers", () => {
    renderWithProviders(<AboutPage />);
    for (const t of teachers) {
      expect(screen.getByText(t.name.en)).toBeInTheDocument();
    }
  });

  test("ContactPage: 4 contact options", () => {
    renderWithProviders(<ContactPage />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
  });

  test("TestimonialsPage: first 2 visible, rest locked for guests", () => {
    renderWithProviders(<TestimonialsPage />);
    expect(testimonials).toHaveLength(4);
    // All names visible (locked ones show name too)
    for (const item of testimonials) {
      expect(screen.getByText(item.name.en)).toBeInTheDocument();
    }
    // Only 2 clickable links for guests
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
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

  test("SchedulePage: Russian day titles", () => {
    renderWithProviders(<SchedulePage />);
    expect(screen.getByText("Прибытие и открытие")).toBeInTheDocument();
  });

  test("AboutPage: Russian teacher names", () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText("Сергий")).toBeInTheDocument();
    expect(screen.getByText("Олена")).toBeInTheDocument();
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

// ── Schedule tabs ───────────────────────────────────────────────

describe("Schedule tabs", () => {
  beforeEach(() => {
    localStorage.removeItem("language");
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
  });
  afterEach(() => localStorage.removeItem("tg_user"));

  test("click Days 2-5 shows Sacred Ceremony + Morning Yoga", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);
    await user.click(screen.getByText("Days 2–5"));
    expect(screen.getByText("Ceremonies — First Round")).toBeInTheDocument();
    expect(screen.getByText("Morning Yoga")).toBeInTheDocument();
    expect(screen.getByText("Sacred Ceremony")).toBeInTheDocument();
  });
});

// ── Guide accordion ─────────────────────────────────────────────

describe("Guide accordion", () => {
  beforeEach(() => localStorage.removeItem("language"));
  afterEach(() => localStorage.removeItem("tg_user"));

  test("packing open by default with items visible", () => {
    renderWithProviders(<GuidePage />);
    expect(
      screen.getByText("Comfortable loose clothing for meditation and yoga")
    ).toBeInTheDocument();
  });

  test("guest: diet section is locked", () => {
    renderWithProviders(<GuidePage />);
    const dietButton = screen.getByText("Diet & Nutrition").closest("button");
    expect(dietButton).toBeDisabled();
  });

  test("logged-in: click diet -> diet opens, packing closes", async () => {
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    expect(
      screen.getByText("Comfortable loose clothing for meditation and yoga")
    ).toBeInTheDocument();

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
  let mockAudios: Array<{ play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; paused: boolean; onended: (() => void) | null; src: string }>;
  let originalAudio: typeof Audio;

  beforeEach(() => {
    mockAudios = [];
    originalAudio = globalThis.Audio;
    globalThis.Audio = function MockAudio(this: any, src?: string) {
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
      (globalThis as any).caches = { open: vi.fn().mockResolvedValue({ match: vi.fn().mockResolvedValue(null) }) };
    }
    localStorage.setItem("tg_user", JSON.stringify({ id: 1, first_name: "Test", auth_date: 1 }));
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
    localStorage.removeItem("tg_user");
  });

  test("only one track plays at a time", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeditationsPage />);

    // attunements have audioUrl, so they render play buttons
    const playButtons = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector(".lucide-play") || btn.querySelector("[class*='play']")
    );

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
