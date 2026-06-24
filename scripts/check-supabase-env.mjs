import fs from "node:fs";
import path from "node:path";

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

loadEnvFile(".env");
loadEnvFile(".env.local");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const requireSupabase = process.env.EXPO_PUBLIC_REQUIRE_SUPABASE;

if (!supabaseUrl) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL in .env.local.");
}

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.");
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
  throw new Error("EXPO_PUBLIC_SUPABASE_URL must look like https://PROJECT_REF.supabase.co.");
}

if (!publishableKey.startsWith("sb_publishable_")) {
  throw new Error("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key.");
}

if (requireSupabase !== "true") {
  throw new Error("Set EXPO_PUBLIC_REQUIRE_SUPABASE=true for production launch builds.");
}

const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
  headers: { apikey: publishableKey },
});

if (!response.ok) {
  throw new Error(`Supabase rejected the configured public env values with HTTP ${response.status}.`);
}

console.log("Supabase env check passed: URL and publishable key are configured and accepted.");
