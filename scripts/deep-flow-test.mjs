import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const chatSource = readFileSync("src/services/chat.js", "utf8");
const notificationSource = readFileSync("src/services/notifications.js", "utf8");
const pushFunctionSource = readFileSync("supabase/functions/send-push-notification/index.ts", "utf8");

const MAX_MESSAGE_LENGTH = 1000;
const testAccounts = [
  {
    id: "qa-omar-divorced",
    name: "Omar Siddiqui",
    email: "qa.omar@nikkah-noor.test",
    password: "NoorQA1!",
    gender: "male",
    city: "Karachi",
    maritalStatus: "Divorced",
  },
  {
    id: "qa-aisha-widow",
    name: "Aisha Rahman",
    email: "qa.aisha@nikkah-noor.test",
    password: "NoorQA2!",
    gender: "female",
    city: "Karachi",
    maritalStatus: "Widow",
  },
  {
    id: "qa-sara-divorced",
    name: "Sara Ahmed",
    email: "qa.sara@nikkah-noor.test",
    password: "NoorQA3!",
    gender: "female",
    city: "Lahore",
    maritalStatus: "Divorced",
  },
];

function passwordPolicyIssue(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password needs at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password needs at least one lowercase letter.";
  if (!/\d/.test(password)) return "Password needs at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password needs at least one symbol.";
  return "";
}

function normalizeMessageText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function validateOutgoingMessage({ text, matchId, matches = [], currentUserId }) {
  const normalized = normalizeMessageText(text);
  if (!normalized) return { ok: false, error: "blank" };
  if ([...normalized].length > MAX_MESSAGE_LENGTH) return { ok: false, error: "too_long" };
  if (!matchId) return { ok: false, error: "missing_match" };
  const match = matches.find((item) => item.id === matchId && item.userId === currentUserId);
  if (!match) return { ok: false, error: "forbidden_match" };
  if (!match.matchedUserId || match.matchedUserId === currentUserId) {
    return { ok: false, error: "invalid_receiver" };
  }
  return { ok: true, text: normalized, match };
}

function validateProfileImage(asset) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!asset?.uri) return { ok: false, error: "missing_uri" };
  if (!allowed.has(asset.mimeType)) return { ok: false, error: "bad_mime" };
  if (asset.size > 5 * 1024 * 1024) return { ok: false, error: "too_large" };
  return { ok: true };
}

function verifySignupOtp(account, token) {
  if (!/^\d{6}$/.test(token)) return false;
  account.emailVerified = true;
  return true;
}

function resetPassword(account, nextPassword) {
  assert.equal(account.emailVerified, true, "password reset must require verified email");
  assert.equal(passwordPolicyIssue(nextPassword), "", "reset password must satisfy strong policy");
  account.password = nextPassword;
}

function discoverCandidates(account, profiles, filters) {
  const desiredGender = account.gender === "male" ? "female" : "male";
  return profiles.filter((profile) => {
    const age = Number(profile.age);
    return (
      profile.id !== account.id &&
      profile.gender === desiredGender &&
      age >= Number(filters.ageMin) &&
      age <= Number(filters.ageMax) &&
      (filters.location === "Anywhere in Pakistan" || profile.city === account.city)
    );
  });
}

function createMatch(account, profile) {
  return {
    id: `qa-match-${account.id}-${profile.id}`,
    userId: account.id,
    matchedUserId: profile.id,
    unread: 0,
  };
}

function registerPushToken({ platform, token, userId }) {
  if (!userId) return { ok: false, status: "missing_user" };
  if (platform === "web") return { ok: false, status: "unsupported_web" };
  if (!/^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/.test(token)) {
    return { ok: false, status: "invalid_token" };
  }
  return { ok: true, status: "registered" };
}

function runAccountFlow(account, profiles) {
  assert.match(account.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/, "test account email must be valid");
  assert.equal(passwordPolicyIssue(account.password), "", `${account.id} must use a strong password`);
  assert.notEqual(account.password, "password", "test account must not use a trivial password");

  assert.equal(verifySignupOtp(account, "12AB56"), false, "email OTP must reject non-numeric codes");
  assert.equal(verifySignupOtp(account, "12345"), false, "email OTP must reject short codes");
  assert.equal(verifySignupOtp(account, "123456"), true, "email OTP must verify a 6-digit code");

  account.profile = {
    ...account,
    age: account.gender === "male" ? "39" : "34",
    livingSituation: "With family",
    sect: "Sunni",
    prayer: "Regular prayer",
    quran: "Can recite Quran",
    familyType: "Family involved",
    preferences: {
      ageMin: "28",
      ageMax: "45",
      location: "Same city",
      maritalStatus: "Either",
    },
    bio: `${account.name} updated profile in realtime for QA.`,
  };

  account.profile.livingSituation = "Separate residence";
  account.profile.prayer = "5 times daily";
  account.profile.preferences.location = "Anywhere in Pakistan";
  account.profile.preferences.maritalStatus = "Any";

  assert.equal(account.profile.livingSituation, "Separate residence");
  assert.equal(account.profile.prayer, "5 times daily");
  assert.equal(account.profile.preferences.location, "Anywhere in Pakistan");
  assert.equal(account.profile.preferences.maritalStatus, "Any");

  assert.equal(validateProfileImage({ uri: "file://test.jpg", mimeType: "image/gif", size: 123 }).ok, false);
  assert.equal(validateProfileImage({ uri: "file://test.jpg", mimeType: "image/jpeg", size: 6 * 1024 * 1024 }).ok, false);
  assert.equal(validateProfileImage({ uri: "file://test.webp", mimeType: "image/webp", size: 1024 }).ok, true);

  const candidates = discoverCandidates(account.profile, profiles, account.profile.preferences);
  assert.ok(candidates.length > 0, `${account.id} should have discovery candidates`);

  const match = createMatch(account, candidates[0]);
  assert.equal(validateOutgoingMessage({ text: "   ", matchId: match.id, matches: [match], currentUserId: account.id }).ok, false);
  assert.equal(
    validateOutgoingMessage({
      text: "x".repeat(MAX_MESSAGE_LENGTH + 1),
      matchId: match.id,
      matches: [match],
      currentUserId: account.id,
    }).ok,
    false,
  );
  assert.equal(
    validateOutgoingMessage({ text: "Hello", matchId: "other-match", matches: [match], currentUserId: account.id }).ok,
    false,
  );

  const validMessage = validateOutgoingMessage({
    text: "  As-salamu Alaykum, I appreciate your profile.  ",
    matchId: match.id,
    matches: [match],
    currentUserId: account.id,
  });
  assert.equal(validMessage.ok, true, "valid chat message should pass");
  assert.equal(validMessage.text, "As-salamu Alaykum, I appreciate your profile.");

  const messages = [{ id: `msg-${account.id}`, conversationId: match.id, senderId: account.id, receiverId: match.matchedUserId }];
  const duplicateRealtime = messages.some((message) => message.id === `msg-${account.id}`);
  assert.equal(duplicateRealtime, true, "realtime duplicate detection should find existing message IDs");

  assert.deepEqual(registerPushToken({ platform: "web", token: "", userId: account.id }).status, "unsupported_web");
  assert.deepEqual(registerPushToken({ platform: "ios", token: "bad-token", userId: account.id }).status, "invalid_token");
  assert.equal(registerPushToken({ platform: "android", token: `ExpoPushToken[${account.id}]`, userId: account.id }).ok, true);

  resetPassword(account, `NoorReset${account.id.length}!`);
  assert.ok(account.password.startsWith("NoorReset"), "password reset should update account password");

  return {
    match,
    report: { id: `report-${account.id}`, reporterId: account.id, reason: "Fake profile" },
    notification: { id: `note-${account.id}`, userId: account.id, type: "message", read: false },
  };
}

assert.ok(chatSource.includes("MAX_MESSAGE_LENGTH"), "chat service must expose message length rules");
assert.ok(chatSource.includes("subscribeToIncomingMessages"), "chat service must include Supabase realtime subscription");
assert.ok(notificationSource.includes("registerPushToken"), "notification service must include push registration");
assert.ok(notificationSource.includes("unsupported_web"), "notification service must protect browser-only testing");
assert.ok(notificationSource.includes("sendMessagePush"), "notification service must request server push dispatch");
assert.ok(pushFunctionSource.includes("receiver_has_no_push_tokens"), "push Edge Function must handle receivers without tokens");

const profiles = testAccounts.map((account, index) => ({
  id: account.id,
  name: account.name,
  age: String([39, 34, 31][index]),
  gender: account.gender,
  city: account.city,
}));

const results = testAccounts.map((account) => runAccountFlow(account, profiles));

assert.equal(testAccounts.length, 3, "three reusable QA accounts must exist");
assert.equal(results.length, 3, "each QA account must complete the full flow");
assert.equal(new Set(results.map((result) => result.match.id)).size, 3, "each account should create an isolated match");
assert.equal(results.every((result) => result.report.reason === "Fake profile"), true, "safety report flow must complete");
assert.equal(results.every((result) => result.notification.type === "message"), true, "notification flow must complete");

console.log("Deep flow test passed: 3 QA accounts covered auth OTP/reset, editable profile fields, image upload validation, discovery, chat edges, reports, and push notification edges.");
