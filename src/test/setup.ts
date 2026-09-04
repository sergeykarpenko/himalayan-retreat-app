import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";
import { guideSections } from "@/data/guide";
import { schedule } from "@/data/schedule";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("tg_profile");
  localStorage.removeItem("hdt_privacy_consent_v1");
  vi.stubGlobal("fetch", vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    const headers = { "Content-Type": "application/json" };
    if (url.includes("/api/guide")) {
      return Promise.resolve(new Response(JSON.stringify({ sections: guideSections.slice(0, 1) }), { headers }));
    }
    if (url.includes("/api/schedule")) {
      return Promise.resolve(new Response(JSON.stringify({ days: schedule.slice(0, 1) }), { headers }));
    }
    return Promise.resolve(new Response(JSON.stringify({ user: null }), { status: 401, headers }));
  }));
});
