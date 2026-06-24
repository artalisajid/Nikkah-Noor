import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("App.js", "utf8");
const screens = readFileSync("src/screens.js", "utf8");
const components = readFileSync("src/components.js", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const appJson = JSON.parse(readFileSync("app.json", "utf8")).expo;

function containsAny(source, phrases) {
  return phrases.some((phrase) => source.toLowerCase().includes(phrase.toLowerCase()));
}

const activeCopy = `${app}\n${screens}\n${components}`;

assert.ok(app.includes("width > 700"), "desktop browser preview must switch to a phone frame");
assert.ok(app.includes("maxWidth: 430"), "desktop browser preview should cap the app at mobile width");
assert.ok(components.includes("minHeight: 50"), "primary and secondary buttons need large mobile tap targets");
assert.ok(components.includes("minHeight: 56"), "bottom navigation needs large mobile tap targets");
assert.ok(screens.includes("paddingBottom: 112"), "scroll screens need bottom-nav safe spacing");
assert.ok(screens.includes("numberOfLines={1}"), "select values should avoid text overflow on narrow devices");
assert.ok(screens.includes("flexWrap: \"wrap\""), "chips and stats should wrap on small screens");
assert.ok(screens.includes("maxWidth: \"82%\""), "chat bubbles should fit narrow devices");

assert.ok(!containsAny(activeCopy, ["phone signup", "send phone code", "Enter phone number"]), "active app copy must not advertise phone signup");
assert.ok(screens.includes("Email verification"), "signup copy must explain email OTP verification");
assert.ok(screens.includes("Forgot password?"), "login copy must expose password reset");
assert.ok(screens.includes("Payment methods prepared"), "payment copy must not imply live checkout");
assert.ok(screens.includes("Checkout is disabled"), "premium screen must disclose disabled checkout");
assert.ok(screens.includes("Never send money"), "chat copy must include safety guidance");
assert.ok(screens.includes("Push notifications"), "notification screen must expose push notification controls");

assert.ok(pkg.dependencies["expo-notifications"], "expo-notifications dependency must be installed");
assert.ok(
  JSON.stringify(appJson.plugins || []).includes("expo-notifications"),
  "Expo notifications plugin must be configured",
);

const requiredScreens = [
  "WelcomeScreen",
  "EmailAuthScreen",
  "EmailOtpScreen",
  "ForgotPasswordScreen",
  "ResetPasswordScreen",
  "GenderScreen",
  "ProfileScreen",
  "HomeScreen",
  "MatchesScreen",
  "ChatScreen",
  "SettingsScreen",
  "PremiumScreen",
  "SafetyScreen",
  "FamilyScreen",
  "PrivacyCenterScreen",
  "LegalScreen",
  "NotificationsScreen",
];

for (const screenName of requiredScreens) {
  assert.ok(screens.includes(`export function ${screenName}`), `${screenName} must be implemented`);
}

console.log("Responsive and copy audit passed: active app copy, mobile tap targets, narrow-screen safeguards, and notification setup are present.");
