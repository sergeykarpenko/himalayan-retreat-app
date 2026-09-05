# Telegram authorization incident — 2026-09-05

## Impact

After the security release, Telegram deep links still opened the bot, but the
web application could not complete login. `POST /api/auth-poll` returned `502`
instead of the bot API's `202 pending` response.

## Root cause

The hardened proxy added `redirect: "error"` to the Cloudflare Pages Function
subrequest. The previously working production implementation used the default
Fetch redirect behavior. In the deployed Cloudflare runtime the stricter mode
caused the upstream request to fail and the client stopped polling with an
`unavailable` error.

The anonymous smoke test did not exercise a syntactically valid login token.
It only checked the missing-token and oversized-body paths, so this regression
was incorrectly left outside the verified release surface.

During the first verification of the fix, a completed Cloudflare check was
also mistaken for completion of both preview and production deployments. The
custom domain was still serving the previous Function at that moment.

## Correction

- Removed the incompatible redirect override while retaining the bounded POST
  body, token validation, optional upstream bearer token and signed HttpOnly
  session creation.
- Added regression tests for the bot's `202 pending` response and successful
  session-cookie creation after bot confirmation.
- Production verification now polls the custom-domain endpoint itself rather
  than relying only on the first Cloudflare check run.

## Verification

- `POST /api/auth-poll` with a new valid 32-character hexadecimal token returns
  `202 application/json` and `{ "status": "pending" }` on both the Pages domain
  and `app.himalayanholytemple.net`.
- The test suite contains 58 passing tests, including the two new auth-poll
  regression cases.
- A real Telegram confirmation remains an end-to-end release check because it
  requires pressing Start in the bot with a controlled Telegram account.
