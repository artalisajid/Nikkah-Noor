# Nikkah Noor Public Launch Checklist

## Completed In This Codebase

- Supabase is required for production builds with `EXPO_PUBLIC_REQUIRE_SUPABASE=true`.
- Supabase URL and publishable key verification is available through `npm run env:check`.
- RLS is enabled and Supabase advisors report no issues.
- Sensitive profile fields are isolated in `profile_private`.
- Account deletion requests are available from the Privacy Center.
- Paid tier buttons no longer grant subscriptions without a real payment provider.
- Web export generates `_headers` and `.well-known/security.txt`.
- Dependency audit currently reports zero vulnerabilities.
- Full launch gate is available through `npm run prod:check`.

## Required Before Public Marketing

- Replace in-app legal summaries with lawyer-reviewed public Privacy Policy, Terms of Service, and Community Guidelines URLs.
- Configure production SMTP in Supabase Auth for email OTP and password reset reliability.
- Configure Supabase Auth rate limits for expected signup volume.
- Connect a real payment provider before enabling paid plans.
- Create a support runbook for reports, verification review, and account deletion requests.
- Replace prototype Unsplash photos with licensed and moderated production assets.
- Add final app icon, splash assets, screenshots, and store listing copy.
- Verify Apple Developer and Google Play Console accounts before mobile store submission.
- Deploy the web build on an HTTPS host that honors the generated `_headers` file.

## Final Gate

Run:

```bash
npm run prod:check
```

Only launch when this command passes and the external requirements above are complete.
