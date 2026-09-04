# Security architecture and operations

## Trust boundary

The React application is untrusted for authorization purposes. UI locks,
route state, `localStorage`, and Cache API entries never grant access. The
signed, HttpOnly `__Host-hdt_session` cookie is validated by Cloudflare Pages
Functions before protected content is returned.

Access matrix:

| Resource | Guest | Signed-in free | Paid participant |
| --- | --- | --- | --- |
| `/api/guide` | Packing | Packing, diet, health | All sections and fasting URL |
| `/api/schedule` | First day | Full schedule | Full schedule |
| `/api/audio/:trackId` | Denied | Free tracks | All tracks |
| Books | Bot deep link only | Delivered by Telegram bot | Delivered by Telegram bot |

The audio origin must be private and require its bearer token. A second public
hostname or bucket URL invalidates the protection. Books are delivered by the
Telegram bot; subscription verification and file authorization belong to that
service, not the web application.

## Required edge controls

Configure Cloudflare rate-limit rules in production. Worker-local counters are
not a security boundary because isolates do not share durable state.

Recommended starting limits (adjust from observed traffic):

| Route | Key | Limit |
| --- | --- | --- |
| `POST /api/auth-poll` | IP | 30/minute, then managed challenge |
| `POST /api/telegram-auth` | IP | 10/minute, then block |
| `GET /api/apple-start` | IP | 10/minute, then managed challenge |
| `POST /api/apple-callback` | IP | 10/minute, then block |
| `POST /api/account-deletion` | IP and authenticated account | 3/hour |

The bot must generate 128-bit random polling tokens, expire them quickly, and
consume them atomically after one successful login. `BOT_API_TOKEN` must be
required by the production bot API.

## Protected-content deployment

1. Upload audio to its private origin.
2. Configure `AUDIO_ORIGIN_URL` and `AUDIO_ORIGIN_TOKEN` in Cloudflare.
3. Confirm the audio origin returns `401` or `403` without its bearer token.
4. Confirm the obsolete `/books/fenomen-suicida.pdf` URL returns `404`.
5. Verify the bot deep link opens its book flow and enforces both subscriptions.
6. Run `npm run check` and `npm run build:functions`.
7. Apply the rate-limit rules above and record evidence in the release ticket.

Protected guide and schedule text remains in Git history. If repository access
was ever public or broader than the intended audience, assume that historical
content was disclosed. Removing it from the current browser bundle cannot undo
that disclosure; rotate/replace genuinely confidential content and, only after
coordination with every clone and deployment, consider a history rewrite.

## Offline media policy

Paid media must not be stored in the origin-wide Cache API. Service worker
activation deletes caches created by older releases. Safe paid offline playback
requires encrypted account-bound storage and short-lived keys; until that is
implemented, paid audio is online-only.

## Security regression checks

- `npm run audit:bundle` scans production assets for protected content markers.
- API tests verify guest/free/paid filtering and private-origin authentication.
- request-limit tests cover streamed bodies without `Content-Length`.
- `npm run audit:prod` rejects every high or critical production advisory.

Report suspected vulnerabilities privately to the maintainers. Do not include
tokens, session cookies, personal data, or exploit details in public issues.
