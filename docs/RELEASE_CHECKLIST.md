# Release checklist

Every required item must be evidenced before public submission. Do not mark
console- or device-only items complete from a source-code build.

Latest production evidence: [smoke test 2026-09-04](SMOKE_TEST_2026-09-04.md)
— **FAIL / NO-GO** because the public PDF and old service worker remain live
and the new protected APIs are not deployed.

## P0 backend and security

- [ ] Production audio origin rejects anonymous direct requests.
- [ ] `SESSION_SECRET`, audio origin token, and `BOT_API_TOKEN` are configured
      in Cloudflare Pages and absent from Git/build logs.
- [ ] Paid and unpaid Telegram users were tested end to end.
- [ ] Paid and unpaid Apple-linked users were tested end to end.
- [ ] The book deep link opens the existing Telegram bot flow, and the bot
      enforces subscription to both required channels before delivery.
- [ ] Account deletion backend accepts and completes both provider types.
- [ ] Auth polling and deletion endpoints have Cloudflare rate-limit rules.
- [ ] `/books/fenomen-suicida.pdf` returns 404 and no book file is included in
      web, iOS, or Android application assets.
- [ ] Guest `/api/guide` and `/api/schedule` responses contain no protected
      sections; paid and unpaid responses match the access matrix.
- [ ] Production JS bundles contain no protected guide/schedule text or private
      origin URLs (`npm run audit:bundle`).
- [ ] A paid audio request is rejected after logout/session expiry even if an
      older release previously populated `audio-cache`.
- [ ] Production CSP/HSTS headers match `public/_headers`.
- [ ] `npm run check` and `npm run build:functions` pass from a clean clone.

## Content and privacy

- [ ] Privacy policy reviewed for the actual legal entity, retention periods,
      processors, countries and contact details.
- [ ] Web consent tested for reject, granular selection, accept and later
      changes.
- [ ] No GA, Meta, or Clarity requests occur before consent.
- [ ] No third-party tracking requests occur in native store builds.
- [ ] 18+ gate and medical warning tested in English and Russian.
- [ ] Book/content received store-policy and legal review.
- [ ] Localized urgent-help wording reviewed for each distribution country.

## Android

- [ ] `versionCode` increased.
- [ ] Release AAB signed with the approved upload key.
- [ ] Play App Signing SHA-256 added to `assetlinks.json`.
- [ ] Digital Asset Links API reports success after deployment.
- [ ] Internal-test install opens as a TWA without an address bar.
- [ ] Login, protected audio, offline playback, logout/cache clearing and
      deletion tested on physical Android.
- [ ] Play Data Safety completed from observed network behavior.
- [ ] Health apps declaration and content rating completed.
- [ ] Privacy-policy and public account-deletion URLs entered.
- [ ] Store listing, screenshots, feature graphic and support contacts final.

## iOS

- [ ] Apple Developer team, distribution certificate and provisioning profile
      configured.
- [ ] Apple Services ID and exact callback registered.
- [ ] `VITE_APPLE_SIGN_IN_ENABLED=true` in the store build.
- [ ] Apple login tested on a physical iPhone, including first-login name/email.
- [ ] Participant entitlement linking works for Apple accounts.
- [ ] Telegram login returns correctly from the Telegram app.
- [ ] Account deletion completes without contacting support.
- [ ] Cold/warm launch checked for white frames and excessive delay.
- [ ] Portrait/landscape and supported iPhone/iPad layouts checked.
- [ ] Signed Archive validates and uploads to TestFlight.
- [ ] TestFlight smoke test completed on a clean device.
- [ ] App Privacy, age rating, privacy/support URLs and review notes completed.
- [ ] Review path works continuously without asking the reviewer to pay,
      contact support, or wait for manual approval.

## Go/no-go

Release is **no-go** if direct paid audio is still public, a login provider is
broken, deletion is not operational, privacy disclosures do not match observed
traffic, or the book has not passed content-policy review.
