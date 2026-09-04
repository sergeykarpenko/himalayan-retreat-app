const COMMON_SECURITY_HEADERS = {
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  const headers = new Headers(response.headers);
  const url = new URL(context.request.url);
  const isApiResponse = url.pathname.startsWith("/api/");
  const contentSecurityPolicy = isApiResponse
    ? "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    : [
        "default-src 'self'",
        "script-src 'self' https://www.googletagmanager.com https://connect.facebook.net https://www.clarity.ms",
        "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com https://*.clarity.ms https://c.bing.com",
        "img-src 'self' data: blob: https:",
        "media-src 'self' blob:",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(url.protocol === "https:" ? ["upgrade-insecure-requests"] : []),
      ].join("; ");

  headers.set("Content-Security-Policy", contentSecurityPolicy);
  for (const [name, value] of Object.entries(COMMON_SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
