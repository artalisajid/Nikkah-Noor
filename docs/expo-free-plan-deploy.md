# Expo Free Plan Deploy

This project is set up for:

- EAS Hosting for the web app
- EAS Update for over-the-air JavaScript, styling, and asset changes
- EAS Build preview APKs for Android device testing

## What updates automatically

After the project is connected to Expo and a GitHub repository:

- Pushes to `main` run [.github/workflows/expo-deploy.yml](</Users/sajidali/Documents/Nikkah Noor/.github/workflows/expo-deploy.yml>)
- The workflow publishes an OTA update to the `production` channel
- The workflow exports the web app and deploys it to EAS Hosting

That means normal app-code changes such as screens, copy, layout, colors, business logic, and bundled assets can reach:

- the hosted web app
- the installed mobile app, after reopening it

## What still needs a fresh mobile build

OTA updates do not replace a native build when you change:

- Expo plugins
- native modules or package installs that include native code
- app icons, splash setup, permissions, bundle/package identifiers
- anything that requires `expo prebuild` or native project regeneration

For those changes, trigger [.github/workflows/android-preview-build.yml](</Users/sajidali/Documents/Nikkah Noor/.github/workflows/android-preview-build.yml>) or run `npm run build:android:preview`.

## First-time setup

1. Use Node `22.22.2` from [.nvmrc](</Users/sajidali/Documents/Nikkah Noor/.nvmrc>).
2. Log in to Expo:

```bash
eas login
```

3. Link the project and configure updates:

```bash
eas update:configure
```

This adds the Expo project linkage values that cannot be generated offline in this workspace.

4. Create the first Android APK:

```bash
npm run build:android:preview
```

5. Deploy the web app the first time:

```bash
npm run deploy:web
```

6. Add these GitHub repository secrets:

- `EXPO_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

7. Push the project to GitHub and keep using the `main` branch for production-facing changes.

## Notes

- Expo's free plan currently includes up to 15 Android and 15 iOS builds, and OTA updates for up to 1K monthly active users.
- EAS Hosting and EAS Update both require an Expo account and project connection before automation can run.
