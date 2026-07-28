// True when running inside the native Capacitor app shell (iOS/Android store build),
// as opposed to a browser tab or installed PWA. Capacitor injects window.Capacitor
// at runtime in the wrapped build; it's simply absent on the plain web deployment.
export function isNativeApp(): boolean {
  return (window as any).Capacitor?.isNativePlatform?.() === true;
}
