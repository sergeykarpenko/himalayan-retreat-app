import { isNativeApp } from "@/lib/platform";

export interface PrivacyConsent {
  version: 1;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const CONSENT_KEY = "hdt_privacy_consent_v1";
export const OPEN_PRIVACY_SETTINGS_EVENT = "hdt:open-privacy-settings";
const GA_ID = "G-S7KVX0LNYJ";
const META_PIXEL_ID = "1316009400285652";
const CLARITY_ID = "viaq0ovw0l";
let analyticsLoaded = false;
let marketingLoaded = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    _fbq?: unknown;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function getPrivacyConsent(): PrivacyConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PrivacyConsent>;
    if (
      parsed.version !== 1 ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return parsed as PrivacyConsent;
  } catch {
    return null;
  }
}

export function savePrivacyConsent(
  choice: Pick<PrivacyConsent, "analytics" | "marketing">,
): PrivacyConsent {
  const consent: PrivacyConsent = {
    version: 1,
    ...choice,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

function loadScript(id: string, src: string): void {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initializeAnalytics(): void {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  window[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });
  loadScript(
    "hdt-google-analytics",
    `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
  );

  window.clarity =
    window.clarity ||
    ((...args: unknown[]) => {
      const queue = (
        window.clarity as ((...items: unknown[]) => void) & {
          q?: unknown[][];
        }
      );
      queue.q = queue.q || [];
      queue.q.push(args);
    });
  loadScript("hdt-clarity", `https://www.clarity.ms/tag/${CLARITY_ID}`);
}

function initializeMarketing(): void {
  if (marketingLoaded) return;
  marketingLoaded = true;

  const pixel = ((...args: unknown[]) => {
    const fbq = pixel as typeof pixel & {
      callMethod?: (...items: unknown[]) => void;
      queue: unknown[][];
      push: typeof pixel;
      loaded: boolean;
      version: string;
    };
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as Window["fbq"] & {
    queue: unknown[][];
    push: unknown;
    loaded: boolean;
    version: string;
  };
  pixel.push = pixel;
  pixel.loaded = true;
  pixel.version = "2.0";
  pixel.queue = [];
  window.fbq = window.fbq || pixel;
  window.fbq("consent", "grant");
  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
  loadScript(
    "hdt-meta-pixel",
    "https://connect.facebook.net/en_US/fbevents.js",
  );
}

export function initializeConsentedTracking(
  consent = getPrivacyConsent(),
): void {
  // Store builds do not load cross-site analytics/marketing scripts. This keeps
  // native tracking disabled unless a future release adds a reviewed ATT flow.
  if (!consent || isNativeApp()) return;
  if (consent.analytics) initializeAnalytics();
  if (consent.marketing) initializeMarketing();
}

export function requestPrivacySettings(): void {
  window.dispatchEvent(new Event(OPEN_PRIVACY_SETTINGS_EVENT));
}
