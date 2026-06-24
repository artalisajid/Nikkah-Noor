import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");

if (!fs.existsSync(distDir)) {
  throw new Error("dist directory does not exist. Run expo export first.");
}

const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
`;

const securityTxt = `Contact: mailto:security@nikkahnoor.example
Policy: https://nikkahnoor.example/security
Preferred-Languages: en, ur
`;

fs.writeFileSync(path.join(distDir, "_headers"), headers);
fs.mkdirSync(path.join(distDir, ".well-known"), { recursive: true });
fs.writeFileSync(path.join(distDir, ".well-known", "security.txt"), securityTxt);

console.log("Post-export hardening complete: security headers and security.txt generated.");
