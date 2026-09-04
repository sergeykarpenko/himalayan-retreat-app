interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

declare global {
  interface Window {
    Capacitor?: CapacitorBridge;
  }
}

export function isNativeApp(): boolean {
  return window.Capacitor?.isNativePlatform?.() === true;
}

export function nativePlatform(): string | null {
  return isNativeApp() ? window.Capacitor?.getPlatform?.() ?? null : null;
}

export function isStandaloneApp(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}
