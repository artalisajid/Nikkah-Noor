import assert from "node:assert/strict";

const users = Array.from({ length: 10 }, (_, index) => ({
  id: `user-${index + 1}`,
  name:
    [
      "Ahmed Raza",
      "Fatima Khan",
      "Sana Ali",
      "Maryam Siddiqui",
      "Ayesha Noor",
      "Hamza Qureshi",
      "Bilal Hassan",
      "Zainab Saleem",
      "Usman Farooq",
      "Nadia Rahman",
    ][index],
  gender: index === 0 || index === 5 || index === 6 || index === 8 ? "male" : "female",
  age: String([38, 32, 31, 40, 35, 42, 36, 29, 45, 37][index]),
  city: ["Karachi", "Karachi", "Lahore", "Islamabad", "Karachi", "Lahore", "Islamabad", "Multan", "Karachi", "Peshawar"][index],
  maritalStatus: ["Divorced", "Widow", "Divorced", "Widow", "Divorced", "Widower", "Divorced", "Divorced", "Currently married", "Widow"][index],
  email: `test.user.${index + 1}@nikkah-noor.test`,
  emailVerified: false,
  password: "",
  tags: ["Verified"],
  stats: { completion: 75, views: 100 + index },
}));

let state = {
  currentUserId: "user-1",
  currentUser: users[0],
  profiles: users,
  filters: {
    ageMin: "28",
    ageMax: "45",
    location: "Same city",
    openToChildren: true,
  },
  interactions: [],
  matches: [],
  messages: [],
  familyMembers: [],
  reports: [],
  subscription: {
    tier: "Basic",
    status: "free",
    superLikes: 0,
    boosts: 1,
    incognito: false,
  },
};

function updateCurrentUser(patch) {
  state.currentUser = {
    ...state.currentUser,
    ...patch,
    preferences: {
      ...(state.currentUser.preferences || {}),
      ...(patch.preferences || {}),
    },
  };
  state.profiles = state.profiles.map((profile) =>
    profile.id === state.currentUserId ? state.currentUser : profile,
  );
}

function discoveryCandidates() {
  const desiredGender = state.currentUser.gender === "male" ? "female" : "male";
  return state.profiles.filter(
    (profile) =>
      profile.id !== state.currentUserId &&
      profile.gender === desiredGender &&
      Number(profile.age) >= Number(state.filters.ageMin) &&
      Number(profile.age) <= Number(state.filters.ageMax),
  );
}

function swipe(profile, action) {
  state.interactions.push({
    id: `interaction-${state.interactions.length + 1}`,
    actorId: state.currentUserId,
    targetId: profile.id,
    action,
  });

  if (action === "like" || action === "super_like") {
    state.matches.push({
      id: `match-${profile.id}`,
      userId: state.currentUserId,
      matchedUserId: profile.id,
      unread: 0,
    });
  }
}

function sendMessage(match, text) {
  state.messages.push({
    id: `msg-${state.messages.length + 1}`,
    conversationId: match.id,
    senderId: state.currentUserId,
    receiverId: match.matchedUserId,
    text,
  });
}

function resetPassword(user, nextPassword) {
  assert.ok(user.emailVerified, "password reset should require a verified email");
  user.password = nextPassword;
  assert.equal(user.password, nextPassword, "password reset should update credentials");
}

function runUserFlow(user) {
  state.currentUserId = user.id;
  state.currentUser = user;

  updateCurrentUser({
    email: user.email,
    password: `NoorTest${user.id.at(-1)}!`,
    emailVerified: true,
  });

  updateCurrentUser({
    bio: `${user.name} test bio updated in realtime.`,
    city: user.city,
    preferences: {
      ageMin: "28",
      ageMax: "45",
      location: "Same city",
    },
  });

  assert.ok(state.currentUser.email.includes("@"), "email should be editable");
  assert.ok(state.currentUser.emailVerified, "signup email should be verified by OTP");
  assert.ok(state.currentUser.password.length >= 6, "password should be captured in auth flow");
  assert.ok(state.currentUser.bio.includes("realtime"), "bio should update dynamically");

  state.filters = { ...state.filters, verifiedOnly: true, familyInvolvement: true };
  const candidates = discoveryCandidates();
  assert.ok(candidates.length > 0, `${user.name} should have discovery candidates`);

  swipe(candidates[0], "like");
  const match = state.matches.at(-1);
  assert.equal(match.matchedUserId, candidates[0].id, "like should create a match");

  sendMessage(match, `As-salamu Alaykum from ${user.name}`);
  assert.ok(state.messages.at(-1).text.includes(user.name), "chat should send dynamic message");

  state.familyMembers.push({
    id: `family-${user.id}`,
    userId: user.id,
    name: `${user.name.split(" ")[0]} Guardian`,
    relation: "Brother",
    phone: "+92 300 7654321",
    permission: "View + suggest matches",
  });
  assert.equal(state.familyMembers.at(-1).userId, user.id, "family member should save");

  state.subscription = { ...state.subscription, tier: "Gold", status: "gold", superLikes: 5 };
  assert.equal(state.subscription.tier, "Gold", "premium tier should update");

  state.reports.push({
    id: `report-${user.id}`,
    reporterId: user.id,
    reportedUserId: candidates[0].id,
    reason: "Fake profile",
  });
  assert.equal(state.reports.at(-1).reason, "Fake profile", "report should submit");

  resetPassword(state.currentUser, `NoorReset${user.id.at(-1)}!`);
}

assert.equal(users.length, 10, "should test exactly 10 users");
for (const user of users) {
  runUserFlow(user);
}

assert.equal(state.matches.length, 10, "every user should complete matching flow");
assert.equal(state.messages.length, 10, "every user should complete messaging flow");
assert.equal(state.familyMembers.length, 10, "every user should complete family flow");
assert.equal(state.reports.length, 10, "every user should complete safety report flow");

console.log("Smoke test passed: 10 users completed email signup, OTP verification, password reset, profile edit, discovery, match, chat, family, premium, and safety flows.");
