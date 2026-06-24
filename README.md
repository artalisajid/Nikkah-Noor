# Nikkah Noor React Native App

This workspace now contains an Expo React Native app for the Nikkah Noor second-marriage matrimonial app concept. The original static HTML prototype is still present as a reference, but the active app entry point is `App.js`.

## Browser Testing

Install dependencies:

```bash
npm install
```

Build the React Native web export:

```bash
npm run check
```

Serve the exported browser build:

```bash
cd dist
python3 -m http.server 8081
```

Open:

```text
http://localhost:8081
```

The current local preview is also available by serving the checked-in `dist` folder:

```bash
cd dist
python3 -m http.server 8081
```

For iterative Expo development, you can also try:

```bash
npm run web
```

In this environment, the Expo dev server hung after "Starting project", so the exported web build is the reliable browser preview path.

## Supabase Setup

This workspace is already connected to a Supabase project named `Nikkah Noor`.

- Project ref: `xytrrmlkriazmziejkkt`
- App env file: `.env.local`
- Schema: [supabase/schema.sql](</Users/sajidali/Documents/Nikkah Noor/supabase/schema.sql>)
- Seed command: `npm run seed:supabase`
- QA account seed command: `npm run seed:test-accounts`
- Goal-diverse 20-profile seed command: `npm run seed:matrimonial`
- Push Edge Function: `supabase/functions/send-push-notification`
- Free email OTP SMTP setup: [docs/free-email-otp.md](</Users/sajidali/Documents/Nikkah Noor/docs/free-email-otp.md>)

To reconnect a different Supabase project later:

1. Create or choose a Supabase project.
2. Open the Supabase SQL editor and run [supabase/schema.sql](</Users/sajidali/Documents/Nikkah Noor/supabase/schema.sql>).
3. Create or update `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

4. Fill in:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

5. Seed 10 test profiles:

```bash
npm run seed:supabase
```

6. Seed three reusable QA personas for targeted chat, notification, and edge-case testing:

```bash
npm run seed:test-accounts
```

The three QA personas are profile records for flow testing:

- `qa-omar-divorced` / `qa.omar@nikkah-noor.test`
- `qa-aisha-widow` / `qa.aisha@nikkah-noor.test`
- `qa-sara-divorced` / `qa.sara@nikkah-noor.test`

Supabase Auth email OTP still requires real inboxes or admin-created Auth users for manual login testing.

7. Seed 20 goal-diverse matrimonial profiles for matching QA:

```bash
npm run seed:matrimonial
```

This adds 10 male and 10 female profiles across goals such as widow/widower with children, fresh start after divorce, second-wife arrangement with consent, overseas relocation, simple Nikah, career-supportive partnership, and separate residence.

When those env vars are missing, the app runs in local persistent demo mode with the same repository interface.

The Supabase schema uses authenticated, user-scoped RLS policies. Public discovery profile fields are column-limited, while email, phone, consent, and arrangement details are stored in `profile_private` and readable only by the owning user.

## Free Email OTP

The app uses Supabase Auth for OTP verification and password reset. For public users, configure a free SMTP provider so OTP emails can be delivered beyond Supabase team members.

Recommended free setup: Brevo SMTP, currently 300 emails/day on the free plan.

```bash
cp .env.smtp.example .env.smtp.local
npm run smtp:check
npm run smtp:configure
```

See [docs/free-email-otp.md](</Users/sajidali/Documents/Nikkah Noor/docs/free-email-otp.md>) for the full setup.

Verify the local Supabase env values:

```bash
npm run env:check
```

## Verification

Run the 10-user flow test:

```bash
npm run smoke
```

This test covers registration edits, profile edits, discovery, matching, chat, family access, premium update, and safety report submission for 10 users.

Run the deeper three-account QA flow and mobile copy audit:

```bash
npm run test:deep
npm run test:matrimonial
npm run test:responsive
```

These tests cover email OTP/reset edge cases, email update requests, realtime-editable profile fields, upload permission/mime/size validation, preference-based discovery, like/dislike/block, chat validation/history, duplicate realtime handling, report flow, web/native notification edge cases, and responsive active-app copy.

Run the security regression checks:

```bash
npm run security
```

This checks profile column exposure, private profile isolation, local cache minimization, upload controls, password policy, and Supabase grant hardening.

Run the full public-launch gate:

```bash
npm run prod:check
```

This runs Supabase env verification, security checks, production static checks, QA flow tests, the 10-user smoke test, dependency audit, and the Expo web export with deployment security headers.

## Public Launch Requirements

Before opening the app to the public:

- Use a lawyer-reviewed Privacy Policy, Terms of Service, and Community Guidelines URL instead of the in-app summary placeholders.
- Configure Brevo or another SMTP provider in Supabase Auth so email OTP and password reset delivery is reliable at launch.
- Configure Supabase Auth rate limits for the expected public signup volume.
- Enable Supabase Auth leaked-password protection after upgrading the Supabase project to Pro or higher. The current project returns a plan restriction for this setting.
- Keep Supabase RLS advisors clean before every release.
- Connect a real payment provider before enabling paid subscription upgrades.
- Add an EAS project ID plus APNs/FCM credentials before expecting real device push delivery.
- Replace prototype Unsplash images with licensed, moderated production assets.
- Set up production support handling for report review and account deletion requests.
- Deploy the web build behind HTTPS with the generated `_headers` file honored by the host.

## Mobile Later

After browser testing and UX finalization:

```bash
npm run ios
npm run android
```

For a downloadable Android APK and push-based OTA updates on Expo's free plan, see [docs/expo-free-plan-deploy.md](</Users/sajidali/Documents/Nikkah Noor/docs/expo-free-plan-deploy.md>).

## Included Flows

- Welcome, language toggle placement, email/password signup, email OTP verification, password reset, gender selection, and marital status
- Profile creation with photo privacy, religious/family details, bio tags, and completion progress
- Discovery feed with profile card, badges, like/pass/super-like actions, filters, details sheet, and match modal
- Matches list, Supabase-backed chat service, realtime incoming message listener, safety notice, icebreakers, and message composer
- Settings/profile management, premium tiers, payment methods, safety center, and family/wali access
- Notifications center with in-app notices, native Expo push token registration, and browser-safe unsupported-state handling
- Supabase Edge Function for private push dispatch after chat messages are saved
- Preference-scored discovery matching with pass, like, super-like, and block filtering

## Design Notes

- Uses the requested premium dark visual direction with gold, emerald, burgundy, teal, and navy accents.
- Keeps the experience app-first rather than a marketing landing page.
- Uses large mobile tap targets, bottom navigation, privacy language, and culturally respectful feature copy.
- External Unsplash images are referenced for prototype visuals; a production app should replace them with licensed, moderated assets.
