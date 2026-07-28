import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.himalayanholytemple.retreat',
  appName: 'Himalayan Retreat',
  webDir: 'dist',
  // Bundled dist is served locally, but the WebView reports this as its origin
  // so relative fetch('/api/...') calls hit the real production Pages Functions
  // (same-origin — no CORS changes needed on the backend).
  server: {
    hostname: 'app.himalayanholytemple.net',
    iosScheme: 'https',
    androidScheme: 'https',
  },
};

export default config;
