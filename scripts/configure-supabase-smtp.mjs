import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const REQUIRED_KEYS = [
  "SUPABASE_PROJECT_REF",
  "SUPABASE_ACCESS_TOKEN",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_ADMIN_EMAIL",
];

const DEFAULTS = {
  SMTP_PROVIDER: "brevo",
  SMTP_HOST: "smtp-relay.brevo.com",
  SMTP_PORT: "587",
  SMTP_SENDER_NAME: "Nikkah Noor",
};

function loadEnvFile(file) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

function usage() {
  console.log(`
Configure Supabase Auth to send OTP/password-reset emails through a custom SMTP provider.

Usage:
  npm run smtp:check
  npm run smtp:configure

Setup:
  1. Create a free Brevo account.
  2. Verify your sender email or domain in Brevo.
  3. Create SMTP credentials in Brevo.
  4. Copy .env.smtp.example to .env.smtp.local and fill values.

Required .env.smtp.local keys:
${REQUIRED_KEYS.map((key) => `  - ${key}`).join("\n")}

Brevo defaults used when not overridden:
  - SMTP_PROVIDER=${DEFAULTS.SMTP_PROVIDER}
  - SMTP_HOST=${DEFAULTS.SMTP_HOST}
  - SMTP_PORT=${DEFAULTS.SMTP_PORT}
  - SMTP_SENDER_NAME=${DEFAULTS.SMTP_SENDER_NAME}
`);
}

function setDefaults() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!process.env[key]) process.env[key] = value;
  }

  if (!process.env.SUPABASE_PROJECT_REF && process.env.EXPO_PUBLIC_SUPABASE_URL) {
    try {
      const host = new URL(process.env.EXPO_PUBLIC_SUPABASE_URL).hostname;
      const [projectRef] = host.split(".");
      if (projectRef) process.env.SUPABASE_PROJECT_REF = projectRef;
    } catch {
      // Validation below will surface a clearer missing project ref message.
    }
  }
}

function validateConfig() {
  const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing SMTP config: ${missing.join(", ")}`);
  }

  const smtpPort = Number.parseInt(process.env.SMTP_PORT, 10);
  if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
    throw new Error("SMTP_PORT must be a positive number.");
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(process.env.SMTP_ADMIN_EMAIL)) {
    throw new Error("SMTP_ADMIN_EMAIL must be a valid verified sender email.");
  }

  return {
    projectRef: process.env.SUPABASE_PROJECT_REF,
    accessToken: process.env.SUPABASE_ACCESS_TOKEN,
    payload: {
      external_email_enabled: true,
      mailer_secure_email_change_enabled: true,
      mailer_autoconfirm: false,
      smtp_admin_email: process.env.SMTP_ADMIN_EMAIL,
      smtp_host: process.env.SMTP_HOST,
      smtp_port: smtpPort,
      smtp_user: process.env.SMTP_USER,
      smtp_pass: process.env.SMTP_PASS,
      smtp_sender_name: process.env.SMTP_SENDER_NAME,
    },
  };
}

function patchAuthConfig({ projectRef, accessToken, payload }) {
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        method: "PATCH",
        hostname: "api.supabase.com",
        path: `/v1/projects/${projectRef}/config/auth`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve({ statusCode: response.statusCode, body: data });
            return;
          }
          reject(new Error(`Supabase API returned ${response.statusCode}: ${data}`));
        });
      },
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

loadEnvFile(".env.smtp.local");
loadEnvFile(".env.local");
setDefaults();

if (process.argv.includes("--help")) {
  usage();
  process.exit(0);
}

try {
  const config = validateConfig();
  const safeSummary = {
    projectRef: config.projectRef,
    smtpHost: config.payload.smtp_host,
    smtpPort: config.payload.smtp_port,
    smtpUser: config.payload.smtp_user,
    smtpAdminEmail: config.payload.smtp_admin_email,
    smtpSenderName: config.payload.smtp_sender_name,
    externalEmailEnabled: config.payload.external_email_enabled,
    secureEmailChangeEnabled: config.payload.mailer_secure_email_change_enabled,
    autoConfirmEmail: config.payload.mailer_autoconfirm,
  };

  if (process.argv.includes("--check")) {
    console.log("SMTP config check passed:");
    console.log(JSON.stringify(safeSummary, null, 2));
    process.exit(0);
  }

  await patchAuthConfig(config);
  console.log("Supabase Auth SMTP configured successfully:");
  console.log(JSON.stringify(safeSummary, null, 2));
} catch (error) {
  console.error(error.message);
  console.error("Run `node scripts/configure-supabase-smtp.mjs --help` for setup instructions.");
  process.exit(1);
}
