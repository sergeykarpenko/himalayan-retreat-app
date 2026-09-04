# Himalayan Retreat App

Mobile-first retreat companion delivered as:

- a React/Vite PWA on Cloudflare Pages;
- an Android Trusted Web Activity;
- an iOS Capacitor wrapper.

Production web origin: `https://app.himalayanholytemple.net`.

## Prerequisites

- Node.js from `.nvmrc` (`22.14.0`) or another version accepted by `package.json`;
- npm 10+;
- Java 21 and Android SDK 36 for Android;
- current Xcode with iOS 15+ Simulator support for iOS;
- Wrangler access for local Pages Functions/deployment.

The Android signing keystore is intentionally not stored in Git. Keep the
keystore and its password in the approved secrets vault.

## Local development

```bash
nvm use
npm ci
npm run dev
```

Use the Pages runtime when testing authentication or protected content:

```bash
npm run dev:pages
```

Copy `.env.example` only for non-secret build flags. Put local Cloudflare
secrets in `.dev.vars`; that filename is ignored by Git.

## Required Cloudflare Pages variables

Secrets:

- `SESSION_SECRET`: at least 32 random characters; signs HttpOnly sessions.
- `AUDIO_ORIGIN_TOKEN`: bearer token accepted only by the private audio origin.
- `BOT_API_TOKEN`: service-to-service token for auth, Apple entitlement and
  deletion backends.
- `TELEGRAM_BOT_TOKEN`: required only by the legacy Telegram Login Widget
  callback.

Configuration:

- `AUDIO_ORIGIN_URL`: private audio base URL, without the filename.
- `BOT_AUTH_URL`: optional override of the Telegram polling endpoint.
- `ACCOUNT_DELETION_URL`: authenticated backend endpoint that accepts account
  deletion requests.
- `APPLE_CLIENT_ID`: Apple Services ID used for web OAuth.
- `APPLE_REDIRECT_URI`: exact HTTPS callback registered at Apple, normally
  `https://app.himalayanholytemple.net/api/apple-callback`.
- `APPLE_ENTITLEMENT_URL`: backend endpoint that maps a verified Apple subject
  to retreat entitlement.

Build variable:

- `VITE_APPLE_SIGN_IN_ENABLED=true` only after Apple OAuth is configured and
  tested. The default is `false` so a broken sign-in button is never shipped.

Generate secrets with a cryptographically secure password manager or:

```bash
openssl rand -base64 48
```

Never put actual values in this README, `.env.example`, commits, build logs, or
store review notes.

## Protected-content contract

The browser never receives the audio origin or its bearer token. It requests
`/api/audio/:trackId`; the Pages Function validates the signed session and paid
entitlement before proxying a byte-range request.

This protection is complete only when the audio origin:

1. rejects requests without `Authorization: Bearer <AUDIO_ORIGIN_TOKEN>`;
2. is not exposed through an alternate public hostname or bucket;
3. does not publish guessable files through a CDN bypass;
4. supports `GET`, `HEAD`, and `Range`.

Until the origin enforces those rules, old direct audio URLs remain a bypass.

Guide and schedule data are requested from `/api/guide` and `/api/schedule`.
Those functions return only the subset allowed by the signed session. Do not
reintroduce imports of `src/data/guide.ts` or `src/data/schedule.ts` into browser
components: doing so publishes the protected text in the JavaScript bundle.

Books are not served by this web application. The Books section opens
`https://t.me/himalayan_retreat_bot?start=book`, where the existing bot checks
the required channel subscriptions and delivers the files. Do not place book
files under `public/` or copy them into native web assets.

Protected audio is deliberately excluded from the service worker and Cache
API. Ordinary browser downloads cannot be revoked after delivery. Encrypted,
account-bound storage plus short-lived keys is required before paid offline
playback can be restored safely.

### Security boundary

- `localStorage` contains only a non-authoritative UI profile; it never grants
  access.
- Authorization is derived from the signed `__Host-hdt_session` cookie.
- Every protected file request is checked by a Pages Function.
- `/api/auth-poll` and `/api/telegram-auth` limit the bytes actually read, so a
  missing or forged `Content-Length` cannot bypass body limits.
- Cloudflare rate-limit rules are still required at the edge; in-process Worker
  counters are not reliable across isolates.

Telegram auth must return a JSON user with an authoritative boolean `paid`
field. Apple entitlement lookup must return the same boolean after linking the
Apple subject to the participant record. A missing or failed entitlement lookup
always results in unpaid access.

The account deletion backend accepts:

```json
{
  "provider": "telegram",
  "provider_user_id": "123456"
}
```

It must return a successful 2xx response only after accepting the deletion
request.

## Verification

Run the complete web/functions gate:

```bash
npm run check
npm run build:functions
```

The production dependency audit fails on every high or critical production
advisory. Do not add advisory exceptions without a written threat-model review.

Android:

```bash
cd android-twa
./gradlew bundleRelease lintRelease
```

The command above intentionally creates an unsigned CI artifact when signing
variables are absent. For an upload build, supply secrets through the process
environment:

```bash
export HDT_ANDROID_KEYSTORE_PATH="/absolute/path/to/android.keystore"
export HDT_ANDROID_KEYSTORE_PASSWORD="[from secrets vault]"
export HDT_ANDROID_KEY_ALIAS="android"
export HDT_ANDROID_KEY_PASSWORD="[from secrets vault]"
cd android-twa
./gradlew clean bundleRelease lintRelease
```

iOS Simulator:

```bash
npm run native:sync
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -sdk iphonesimulator \
  CODE_SIGNING_ALLOWED=NO \
  build
```

CI runs web/functions, Android release/lint, and iOS Release Simulator jobs.

## Android release

1. Increase `versionCode` for every Play upload.
2. Build with the approved upload keystore.
3. In Play Console, copy the **App signing key certificate SHA-256**.
4. Add it without removing the upload fingerprint:

   ```bash
   npm run assetlinks:add -- "AA:BB:...:FF"
   ```

5. Deploy the updated `assetlinks.json`.
6. Verify it with Google Digital Asset Links and on an internal-test install.
7. Confirm the TWA has no browser address bar.
8. Complete Data Safety, content rating, health-content declaration, privacy
   policy URL, account-deletion URL, screenshots, and reviewer instructions.

## iOS release

1. Configure the Apple Developer team and App Store provisioning.
2. Register the Apple Services ID and callback URL.
3. Configure all Apple/entitlement environment variables.
4. Build the store web bundle with `VITE_APPLE_SIGN_IN_ENABLED=true`.
5. Test Telegram and Apple login, account deletion, paid/unpaid access, offline
   audio, privacy controls, and the 18+ book gate on physical iPhone hardware.
6. Create a signed Archive and upload to TestFlight.
7. Complete App Privacy, age rating, privacy-policy URL, support URL,
   screenshots, review notes, and a stable review login path.

Third-party analytics and marketing scripts are disabled in native store
builds. Do not enable them without a separately reviewed App Tracking
Transparency implementation and updated privacy disclosures.

## Content and review warning

The included 18+ book discusses suicide, mental health, psychoactive substances,
and spiritual practices. The app presents an age/content gate and medical
disclaimer, but those controls do not guarantee acceptance by Apple or Google.
Store text, age rating and reviewer notes must describe the content accurately.
A policy/legal review remains required before submission.

See [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) for the final release gate.
