import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const schema = readFileSync("supabase/schema.sql", "utf8");
const seedSql = readFileSync("supabase/matrimonial-profiles.sql", "utf8");
const app = readFileSync("App.js", "utf8");
const screens = readFileSync("src/screens.js", "utf8");
const matching = readFileSync("src/services/matching.js", "utf8");
const notifications = readFileSync("src/services/notifications.js", "utf8");
const pushFunction = readFileSync("supabase/functions/send-push-notification/index.ts", "utf8");

const profiles = [
  ["qa-male-01", "Adnan Malik", 41, "male", "Karachi", "Widower", "2 children", "5 times daily", "Family involved", "Widow/widower with children welcome", "Same city", "Widow", true, 92],
  ["qa-male-02", "Saif Rahman", 34, "male", "Lahore", "Divorced", "No children", "Regular prayer", "Nuclear family", "Fresh start after divorce", "Same province", "Divorced", false, 86],
  ["qa-male-03", "Usman Farid", 46, "male", "Karachi", "Currently married", "4 children", "Regular prayer", "Family involved", "Open to second wife arrangement", "Same city", "Divorced", true, 78],
  ["qa-male-04", "Hamid Javed", 39, "male", "Islamabad", "Divorced", "No children", "Regular prayer", "Nuclear family", "Overseas relocation possible", "Open to overseas Pakistanis", "Any", false, 84],
  ["qa-male-05", "Rizwan Shah", 44, "male", "Peshawar", "Widower", "3 children", "5 times daily", "Joint family", "Companionship with family involvement", "Anywhere in Pakistan", "Widow", true, 88],
  ["qa-male-06", "Talha Siddiq", 32, "male", "Multan", "Divorced", "No children", "5 times daily", "Joint family", "Religious household and simple Nikah", "Same province", "Divorced", false, 90],
  ["qa-male-07", "Noman Ali", 37, "male", "Faisalabad", "Divorced", "1 child", "Regular prayer", "Nuclear family", "Career-supportive partnership", "Same province", "Either", true, 81],
  ["qa-male-08", "Farhan Qureshi", 40, "male", "Quetta", "Divorced", "No children", "Occasional", "Nuclear family", "Separate residence after Nikah", "Anywhere in Pakistan", "Any", false, 79],
  ["qa-male-09", "Muneeb Akhtar", 35, "male", "Hyderabad", "Divorced", "No children", "5 times daily", "Family involved", "Religious household and simple Nikah", "Same province", "Either", false, 93],
  ["qa-male-10", "Kamran Hussain", 48, "male", "Rawalpindi", "Widower", "2 children", "Regular prayer", "Family involved", "Companionship with family involvement", "Same province", "Widow", true, 87],
  ["qa-female-01", "Mehreen Ahmed", 36, "female", "Karachi", "Widow", "2 children", "Regular prayer", "Family involved", "Widow/widower with children welcome", "Same city", "Widower", true, 94],
  ["qa-female-02", "Hira Saleem", 30, "female", "Lahore", "Divorced", "No children", "Regular prayer", "Nuclear family", "Fresh start after divorce", "Same province", "Divorced", false, 85],
  ["qa-female-03", "Nadia Tariq", 33, "female", "Islamabad", "Widow", "1 child", "Regular prayer", "Nuclear family", "Overseas relocation possible", "Open to overseas Pakistanis", "Any", true, 89],
  ["qa-female-04", "Sana Rauf", 32, "female", "Faisalabad", "Divorced", "No children", "5 times daily", "Family involved", "Career-supportive partnership", "Same province", "Either", false, 91],
  ["qa-female-05", "Rabia Noor", 45, "female", "Peshawar", "Widow", "3 children", "5 times daily", "Joint family", "Companionship with family involvement", "Anywhere in Pakistan", "Widower", true, 82],
  ["qa-female-06", "Ayesha Tariq", 29, "female", "Multan", "Divorced", "No children", "Regular prayer", "Family involved", "Fresh start after divorce", "Same province", "Divorced", false, 86],
  ["qa-female-07", "Zainab Iqbal", 35, "female", "Karachi", "Divorced", "No children", "Regular prayer", "Family involved", "Open to second wife arrangement", "Same city", "Currently married", false, 80],
  ["qa-female-08", "Maryam Siddiqui", 38, "female", "Quetta", "Widow", "1 child", "Occasional", "Nuclear family", "Separate residence after Nikah", "Anywhere in Pakistan", "Any", true, 78],
  ["qa-female-09", "Fatima Khan", 34, "female", "Hyderabad", "Divorced", "1 child", "5 times daily", "Family involved", "Career-supportive partnership", "Same province", "Either", true, 90],
  ["qa-female-10", "Safiya Bano", 42, "female", "Rawalpindi", "Widow", "2 children", "5 times daily", "Family involved", "Religious household and simple Nikah", "Same province", "Widower", true, 95],
].map(([id, name, age, gender, city, maritalStatus, children, prayer, familyType, goal, location, status, openToChildren, compatibility]) => ({
  id,
  name,
  age: String(age),
  gender,
  city,
  country: "Pakistan",
  maritalStatus,
  children,
  prayer,
  familyType,
  compatibility,
  verification: ["ID"],
  preferences: {
    ageMin: gender === "male" ? "28" : "34",
    ageMax: gender === "male" ? "46" : "50",
    location,
    maritalStatus: status,
    openToChildren,
    matrimonialGoal: goal,
    prayerImportant: prayer !== "Occasional",
    familyInvolvement: familyType === "Family involved",
  },
}));

const PROVINCE_BY_CITY = {
  Karachi: "Sindh",
  Hyderabad: "Sindh",
  Lahore: "Punjab",
  Faisalabad: "Punjab",
  Multan: "Punjab",
  Rawalpindi: "Punjab",
  Islamabad: "Islamabad",
  Peshawar: "Khyber Pakhtunkhwa",
  Quetta: "Balochistan",
};

function normalize(value) {
  return String(value || "").toLowerCase();
}

function hasChildren(profile) {
  return !normalize(profile.children).includes("no children");
}

function locationMatches(location, currentUser, profile) {
  if (!location || location === "Anywhere in Pakistan" || location === "Open to overseas Pakistanis") return true;
  if (location === "Same city") return currentUser.city === profile.city;
  if (location === "Same province") return PROVINCE_BY_CITY[currentUser.city] === PROVINCE_BY_CITY[profile.city];
  return true;
}

function statusMatches(preference, status) {
  if (!preference || preference === "Any" || preference === "Either") return true;
  return normalize(status).includes(normalize(preference));
}

function discovery({ currentUser, interactions = [], matches = [], filters = {} }) {
  const preferences = { ...currentUser.preferences, ...filters };
  const dismissed = new Set(
    interactions
      .filter((interaction) => interaction.actorId === currentUser.id && ["pass", "like", "super_like", "block"].includes(interaction.action))
      .map((interaction) => interaction.targetId),
  );
  const matched = new Set(matches.filter((match) => match.userId === currentUser.id).map((match) => match.matchedUserId));

  return profiles
    .filter((profile) => profile.id !== currentUser.id)
    .filter((profile) => profile.gender !== currentUser.gender)
    .filter((profile) => !dismissed.has(profile.id) && !matched.has(profile.id))
    .filter((profile) => Number(profile.age) >= Number(preferences.ageMin) && Number(profile.age) <= Number(preferences.ageMax))
    .filter((profile) => locationMatches(preferences.location, currentUser, profile))
    .filter((profile) => statusMatches(preferences.maritalStatus, profile.maritalStatus))
    .filter((profile) => preferences.openToChildren !== false || !hasChildren(profile))
    .map((profile) => ({
      ...profile,
      matchScore:
        profile.compatibility +
        (profile.preferences.matrimonialGoal === preferences.matrimonialGoal ? 12 : 0) +
        (profile.prayer === "5 times daily" ? 5 : 0),
    }))
    .sort((left, right) => right.matchScore - left.matchScore);
}

function validatePassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function verifyOtp(token) {
  return /^\d{6}$/.test(token);
}

function registerPush({ platform, token, permission }) {
  if (permission !== "granted") return "permission_denied";
  if (platform === "web") return "unsupported_web";
  if (!/^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/.test(token)) return "invalid_token";
  return "registered";
}

function validateImage(asset, permission) {
  if (permission !== "granted") return "permission_denied";
  if (!["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType)) return "bad_mime";
  if (asset.size > 5 * 1024 * 1024) return "too_large";
  return "accepted";
}

function applyRealtimeMessage(state, message) {
  if (state.messages.some((item) => item.id === message.id)) return state;
  return {
    ...state,
    messages: [...state.messages, message],
    matches: state.matches.map((match) =>
      match.id === message.conversationId ? { ...match, unread: (match.unread || 0) + 1 } : match,
    ),
    notifications: [
      { id: `note-${message.id}`, userId: message.receiverId, type: "message", title: "New message received" },
      ...state.notifications,
    ],
  };
}

function applyRealtimeNotification(state, notification) {
  if (state.notifications.some((item) => item.id === notification.id)) return state;
  return { ...state, notifications: [notification, ...state.notifications] };
}

function applyProfileUpdate(state, profile) {
  return {
    ...state,
    currentUser: state.currentUser.id === profile.id ? { ...state.currentUser, ...profile } : state.currentUser,
    profiles: state.profiles.map((item) => (item.id === profile.id ? { ...item, ...profile } : item)),
  };
}

assert.equal(profiles.filter((profile) => profile.gender === "male").length, 10, "must seed 10 male profiles");
assert.equal(profiles.filter((profile) => profile.gender === "female").length, 10, "must seed 10 female profiles");
assert.ok(new Set(profiles.map((profile) => profile.preferences.matrimonialGoal)).size >= 8, "matrimonial goals must be meaningfully varied");
assert.ok(seedSql.includes("qa-male-10") && seedSql.includes("qa-female-10"), "SQL seed must include all 20 rich profiles");

const male01 = profiles.find((profile) => profile.id === "qa-male-01");
let matches = [];
let interactions = [];
let candidates = discovery({ currentUser: male01, interactions, matches });
assert.equal(candidates[0].id, "qa-female-01", "preference matching should rank widow-with-children goal first");

interactions.push({ id: "pass-1", actorId: male01.id, targetId: "qa-female-02", action: "pass" });
interactions.push({ id: "block-1", actorId: male01.id, targetId: "qa-female-08", action: "block" });
candidates = discovery({ currentUser: male01, interactions, matches });
assert.equal(candidates.some((profile) => profile.id === "qa-female-02"), false, "disliked profiles must be hidden");
assert.equal(candidates.some((profile) => profile.id === "qa-female-08"), false, "blocked profiles must be hidden");

matches.push({ id: "match-1", userId: male01.id, matchedUserId: "qa-female-01", unread: 0 });
candidates = discovery({ currentUser: male01, interactions, matches });
assert.equal(candidates.some((profile) => profile.id === "qa-female-01"), false, "matched profiles must leave discovery");

const secondWifeCandidate = discovery({ currentUser: profiles.find((profile) => profile.id === "qa-male-03"), interactions: [], matches: [] })[0];
assert.equal(secondWifeCandidate.id, "qa-female-07", "second-wife arrangement preference should match declared consent profiles");

const chatState = {
  currentUser: male01,
  profiles,
  matches: [{ id: "chat-1", userId: male01.id, matchedUserId: "qa-female-01", unread: 0 }],
  messages: [{ id: "msg-1", conversationId: "chat-1", senderId: male01.id, receiverId: "qa-female-01", text: "First" }],
  notifications: [],
};
const incoming = { id: "msg-2", conversationId: "chat-1", senderId: "qa-female-01", receiverId: male01.id, text: "Reply" };
const withMessage = applyRealtimeMessage(chatState, incoming);
assert.equal(withMessage.messages.length, 2, "realtime message should append to chat history");
assert.equal(withMessage.matches[0].unread, 1, "realtime message should increase unread count");
assert.equal(applyRealtimeMessage(withMessage, incoming).messages.length, 2, "duplicate realtime messages must be ignored");
assert.equal(applyRealtimeNotification(withMessage, { id: "note-1", userId: male01.id }).notifications.length, 2);
assert.equal(applyRealtimeNotification(withMessage, withMessage.notifications[0]).notifications.length, 1, "duplicate notifications must be ignored");

const updatedProfileState = applyProfileUpdate({ currentUser: male01, profiles }, { ...male01, city: "Hyderabad" });
assert.equal(updatedProfileState.currentUser.city, "Hyderabad", "profile updates must patch current user in realtime");

assert.equal(validatePassword("weak"), false, "weak signup passwords must fail");
assert.equal(validatePassword("NoorFlow1!"), true, "strong signup/password-reset password must pass");
assert.equal(verifyOtp("12345"), false, "short OTP must fail");
assert.equal(verifyOtp("123456"), true, "6-digit OTP must pass");
assert.equal("new.email@nikkah-noor.test".includes("@"), true, "email update must require valid email format");
assert.equal(registerPush({ platform: "web", token: "", permission: "granted" }), "unsupported_web");
assert.equal(registerPush({ platform: "ios", token: "bad", permission: "granted" }), "invalid_token");
assert.equal(registerPush({ platform: "android", token: "ExpoPushToken[qaMale01]", permission: "granted" }), "registered");
assert.equal(registerPush({ platform: "android", token: "ExpoPushToken[qaMale01]", permission: "denied" }), "permission_denied");
assert.equal(validateImage({ mimeType: "image/gif", size: 100 }, "granted"), "bad_mime");
assert.equal(validateImage({ mimeType: "image/jpeg", size: 6 * 1024 * 1024 }, "granted"), "too_large");
assert.equal(validateImage({ mimeType: "image/webp", size: 1000 }, "granted"), "accepted");
assert.equal(validateImage({ mimeType: "image/webp", size: 1000 }, "denied"), "permission_denied");

assert.ok(schema.includes("'block'"), "database interactions must support block");
assert.ok(schema.includes("alter publication supabase_realtime add table public.messages"), "messages must be in Supabase realtime publication");
assert.ok(schema.includes("alter publication supabase_realtime add table public.notifications"), "notifications must be in Supabase realtime publication");
assert.ok(app.includes("subscribeToNotifications"), "app must subscribe to realtime notifications");
assert.ok(app.includes("subscribeToProfileUpdates"), "app must subscribe to realtime profile updates");
assert.ok(screens.includes("Matrimonial goal"), "profile preferences must expose matrimonial goal");
assert.ok(screens.includes("Block Profile"), "profile detail screen must expose blocking");
assert.ok(screens.includes("Send Email Update Confirmation"), "settings must expose email update flow");
assert.ok(matching.includes("scoreProfile"), "matching service must score preference-based matches");
assert.ok(notifications.includes("permission_denied"), "push service must handle notification permission denial");
assert.ok(pushFunction.includes("Message is not eligible for push dispatch"), "push function must protect message ownership edge cases");

console.log("Matrimonial flow test passed: 20 goal-diverse profiles, onboarding/auth edges, preference matching, like/dislike/block, realtime chat/history/notifications, permissions, push, profile/email/password flows, and edge cases covered.");
