import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";

import { schedule } from "@/data/schedule";
import { teachers } from "@/data/about";
import { guideSections } from "@/data/guide";
import { meditations } from "@/data/meditations";

import { BottomNav } from "@/components/layout/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { SchedulePage } from "@/pages/SchedulePage";
import { MeditationsPage } from "@/pages/MeditationsPage";
import { GuidePage } from "@/pages/GuidePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
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

  test("HomePage: heading + 6 quick links", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Himalayan Retreat")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(6);
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

  test("MeditationsPage: all tracks rendered", () => {
    renderWithProviders(<MeditationsPage />);
    for (const track of meditations) {
      expect(screen.getByText(track.title.en)).toBeInTheDocument();
    }
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
  beforeEach(() => localStorage.removeItem("language"));

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

  test("packing open by default with items visible", () => {
    renderWithProviders(<GuidePage />);
    expect(
      screen.getByText("Comfortable loose clothing for meditation and yoga")
    ).toBeInTheDocument();
  });

  test("click diet -> diet opens, packing closes", async () => {
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
