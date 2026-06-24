# Free Email OTP Setup

Nikkah Noor uses Supabase Auth for email/password signup, email OTP verification, email-change confirmation, forgot password, and password reset.

For public users, Supabase Auth should use a custom SMTP provider. The recommended free starting option is Brevo SMTP because its free plan currently provides 300 emails per day.

## Why Custom SMTP Is Needed

Supabase's default mailer is only for demos and testing. Without custom SMTP, Supabase Auth may only send to project team addresses and is rate-limited heavily.

## Recommended Free Provider

Brevo SMTP:

- Host: `smtp-relay.brevo.com`
- Port: `587`
- Free limit: 300 emails/day
- Use case: signup OTP, resend OTP, forgot password, email update confirmations

## Setup

1. Create a free Brevo account.
2. Verify a sender email or sending domain in Brevo.
   - For local/browser testing, you can verify a personal email address such as Gmail or Outlook.
   - For public launch, use a domain sender like `no-reply@your-domain.com` and configure DKIM/SPF/DMARC.
3. Create Brevo SMTP credentials.
4. Copy the example env file:

```bash
cp .env.smtp.example .env.smtp.local
```

5. Fill in:

```text
SUPABASE_ACCESS_TOKEN=
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=
```

The local setup file already defaults to:

```text
SMTP_PROVIDER=brevo
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SENDER_NAME=Nikkah Noor
```

6. Check the config without sending secrets to the terminal:

```bash
npm run smtp:check
```

7. Configure Supabase Auth SMTP:

```bash
npm run smtp:configure
```

## What This Changes

The app code stays on Supabase Auth:

- `signUpWithEmail` sends the signup OTP email.
- `verifyEmailOtp` verifies the code.
- `resendSignupOtp` resends the code.
- `sendPasswordReset` sends the reset email.
- `updateEmailAddress` sends secure email-change confirmation.

Only the delivery service changes from Supabase's default mailer to Brevo SMTP.

## Brevo Dashboard Values

In Brevo, open the SMTP page and copy:

- SMTP server: `smtp-relay.brevo.com`
- SMTP login: paste into `SMTP_USER`
- SMTP key: paste into `SMTP_PASS`

Use an SMTP key, not a Brevo API key.

## Security Notes

- Never place SMTP credentials in `.env.local` with `EXPO_PUBLIC_` names.
- Keep SMTP credentials in `.env.smtp.local`, which is ignored by git.
- Keep `mailer_autoconfirm` disabled so signup still requires email verification.
- Keep secure email change enabled so account email updates require confirmation.
