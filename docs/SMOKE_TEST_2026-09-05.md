# Production smoke test — 2026-09-05

Target: `https://app.himalayanholytemple.net`

Deployment: `cea37c3` (`Trigger Cloudflare deployment after reconnect`)

Result: **PASS for anonymous/public scenarios**. Authenticated, paid and bot
subscription scenarios still require controlled Telegram test accounts.

## Deployment recovery

- Restored access for the Cloudflare Workers and Pages GitHub App to
  `sergeykarpenko/himalayan-retreat-app`.
- Confirmed the Cloudflare disconnected-repository warning disappeared.
- Added a production `SESSION_SECRET` as an encrypted secret.
- Triggered a new `main` deployment and confirmed Cloudflare cloned `cea37c3`,
  ran `npm run build`, discovered the `functions` directory and published the
  assets and Pages Functions successfully.

## HTTP and security checks

| Check | Result |
| --- | --- |
| `/` | `200 text/html`, new 2,190-byte build |
| `/api/session` as guest | `401 application/json`, `{ "user": null }` |
| `/api/guide` as guest | `200 application/json`, packing section only |
| `/api/schedule` as guest | `200 application/json`, first day only |
| `/api/audio/calm-confidence` as guest | `401 authentication_required` |
| `/books/fenomen-suicida.pdf` | `404 not_found` |
| Oversized `/api/auth-poll` body | `413 request_too_large` |
| Oversized `/api/telegram-auth` body | `413 request_too_large` |
| Cross-origin account deletion | `403 cross_origin_request_denied` |
| Guest logout | `200`; clears the signed HttpOnly session cookie |
| CSP and HSTS | Present |
| Service worker | No `CacheFirst`/`audio-cache`; protected API bypass present |

## Browser checks

Tested with a 390x844 viewport:

- Privacy consent reject flow works.
- Russian/English switching works.
- Home, schedule, meditations, guide, about, testimonials, contact, privacy,
  terms and account routes render.
- The first schedule accordion opens and closes.
- Guest meditations page links books to
  `https://t.me/himalayan_retreat_bot?start=book`.
- No browser console errors or warnings were observed during the route pass.

External Telegram links were inspected but not opened. No login, purchase,
subscription, book delivery or account deletion was performed.
