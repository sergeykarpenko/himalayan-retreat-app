# Production smoke test — 2026-09-04

Target: `https://app.himalayanholytemple.net`

Result: **FAIL / NO-GO**. The production deployment does not contain the
current security fixes and must not be treated as release-ready.

## Guest UI

- Main guest routes load on a 390x844 mobile viewport: `/`, `/schedule`,
  `/meditations`, `/guide`, `/about`, `/testimonials`, and `/contact`.
- Russian/English switching works.
- The first schedule day can be expanded and collapsed.
- Telegram login, install and booking links point to
  `https://t.me/himalayan_retreat_bot` with the expected `start` parameters.
- External Telegram/login links were inspected but not opened. No login,
  purchase, subscription, account deletion, or other state-changing action was
  performed.
- `/privacy`, `/terms`, and `/account` are missing from the deployed client.
  React reports `No routes matched location` for all three paths.
- The theme button has no accessible name.

## Blocking production findings

| Check | Expected | Observed |
| --- | --- | --- |
| `GET /books/fenomen-suicida.pdf` | `404` | `200 application/pdf`, 2,249,603 bytes, publicly cacheable for 4 hours |
| `GET /api/session` | JSON session response | `200 text/html` SPA fallback |
| `GET /api/guide` | Filtered JSON | `200 text/html` SPA fallback |
| `GET /api/schedule` | Filtered JSON | `200 text/html` SPA fallback |
| `GET /api/audio/calm-confidence` as guest | Authentication error | `200 text/html` SPA fallback |
| Service worker | Never cache protected audio | Deployed Workbox worker registers `CacheFirst` `audio-cache` for MP3/M4A |
| Security headers | CSP and HSTS present | Neither `Content-Security-Policy` nor `Strict-Transport-Security` is returned |
| Legal/account routes | Render pages | Routes absent from deployed bundle |

The root response also includes `Access-Control-Allow-Origin: *`. The existing
`GET /api/auth-poll` function is reachable and rejects a missing token with
`400`, but an oversized body without a token produces the same response and
does not prove that the new streaming size limit is deployed.

## Local release candidate verification

`npm run check` passed after the production checks:

- ESLint passed.
- Vitest: 7 files, 56 tests passed.
- TypeScript and Vite production build passed.
- Bundle audit found no protected content markers.
- Functions typecheck passed.
- Production dependency audit reported no high or critical advisories.

## Required before retest

1. Deploy the current web bundle, Pages Functions, `_headers`, and service
   worker from this repository together.
2. Purge the CDN copy of `/books/fenomen-suicida.pdf` and verify it returns
   `404` from a clean browser and with `curl`.
3. Purge/update the old service worker and verify legacy `audio-cache` is
   removed on activation.
4. Configure production secrets and origins listed in `.env.example`.
5. Repeat anonymous API/header checks, then complete paid and unpaid Telegram
   user flows with controlled test accounts.
6. Verify in the Telegram bot that both required channel subscriptions are
   enforced before the book link/file is delivered.
