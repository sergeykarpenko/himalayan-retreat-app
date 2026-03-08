import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./test-utils";

import { Header } from "@/components/layout/Header";
import { MeditationsPage } from "@/pages/MeditationsPage";

const mockUser = {
  id: 123456,
  first_name: "Serhii",
  username: "serhii_k",
  photo_url: "https://t.me/photo.jpg",
  auth_date: Math.floor(Date.now() / 1000),
};

// ── AuthContext ──────────────────────────────────────────────────

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.removeItem("tg_user");
  });

  test("no user by default — shows Telegram login button", () => {
    renderWithProviders(<Header />);
    expect(screen.getByTestId("telegram-login")).toBeInTheDocument();
  });

  test("loads user from localStorage", () => {
    localStorage.setItem("tg_user", JSON.stringify(mockUser));
    renderWithProviders(<Header />);
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.getByAltText("Serhii")).toBeInTheDocument();
  });

  test("corrupted JSON in localStorage does not crash", () => {
    localStorage.setItem("tg_user", "{broken json!!!");
    renderWithProviders(<Header />);
    expect(screen.getByTestId("telegram-login")).toBeInTheDocument();
  });

  test("invalid data shape in localStorage does not crash", () => {
    localStorage.setItem("tg_user", JSON.stringify({ foo: "bar" }));
    renderWithProviders(<Header />);
    expect(screen.getByTestId("telegram-login")).toBeInTheDocument();
  });

  test("logout clears user", async () => {
    localStorage.setItem("tg_user", JSON.stringify(mockUser));
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(screen.getByTestId("telegram-login")).toBeInTheDocument();
    expect(localStorage.getItem("tg_user")).toBeNull();
  });
});

// ── Header auth UI ──────────────────────────────────────────────

describe("Header auth UI", () => {
  beforeEach(() => localStorage.removeItem("tg_user"));

  test("shows Telegram login button when no user", () => {
    renderWithProviders(<Header />);
    expect(screen.getByTestId("telegram-login")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });

  test("shows avatar and Logout when user present", () => {
    localStorage.setItem("tg_user", JSON.stringify(mockUser));
    renderWithProviders(<Header />);
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.queryByTestId("telegram-login")).not.toBeInTheDocument();
  });

  test("shows initial letter when no photo_url", () => {
    const noPhoto = { ...mockUser, photo_url: undefined };
    localStorage.setItem("tg_user", JSON.stringify(noPhoto));
    renderWithProviders(<Header />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });
});

// ── MeditationsPage gating ──────────────────────────────────────

describe("MeditationsPage gating", () => {
  beforeEach(() => localStorage.removeItem("tg_user"));

  test("shows login prompt when no user", () => {
    renderWithProviders(<MeditationsPage />);
    expect(
      screen.getByText("Sign in to unlock meditations, schedule and other features")
    ).toBeInTheDocument();
    expect(screen.getByTestId("telegram-login")).toBeInTheDocument();
  });

  test("shows meditation tracks when user logged in", () => {
    localStorage.setItem("tg_user", JSON.stringify(mockUser));
    renderWithProviders(<MeditationsPage />);
    expect(
      screen.queryByText("Login with Telegram to access meditations")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Will be available during the retreat")
    ).toBeInTheDocument();
  });

  test("shows locked tracks for unpaid user", () => {
    localStorage.setItem("tg_user", JSON.stringify(mockUser));
    renderWithProviders(<MeditationsPage />);
    expect(screen.getAllByText("Available for retreat participants").length).toBeGreaterThan(0);
  });

  test("shows all tracks for paid user", () => {
    localStorage.setItem("tg_user", JSON.stringify({ ...mockUser, paid: true }));
    renderWithProviders(<MeditationsPage />);
    expect(screen.queryByText("Available for retreat participants")).not.toBeInTheDocument();
  });
});

// ── verifyTelegramAuth ──────────────────────────────────────────

describe("verifyTelegramAuth", () => {
  test("returns user on successful verification", async () => {
    const { verifyTelegramAuth } = await import("@/lib/telegram-auth");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });
    const result = await verifyTelegramAuth({ id: 123, hash: "abc" });
    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith("/api/telegram-auth", expect.objectContaining({
      method: "POST",
    }));
  });

  test("throws on 401 response", async () => {
    const { verifyTelegramAuth } = await import("@/lib/telegram-auth");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid hash" }),
    });
    await expect(verifyTelegramAuth({ id: 123 })).rejects.toThrow("Invalid hash");
  });
});
