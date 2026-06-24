const PROVINCE_BY_CITY = {
  Karachi: "Sindh",
  Hyderabad: "Sindh",
  Sukkur: "Sindh",
  Lahore: "Punjab",
  Faisalabad: "Punjab",
  Multan: "Punjab",
  Rawalpindi: "Punjab",
  Islamabad: "Islamabad",
  Peshawar: "Khyber Pakhtunkhwa",
  Quetta: "Balochistan",
};

const DISMISSED_ACTIONS = new Set(["pass", "like", "super_like", "block"]);

function numberOrFallback(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hasChildren(profile) {
  const children = normalize(profile.children);
  return children && !children.includes("no children") && children !== "0";
}

function statusMatches(preference, status) {
  const preferred = normalize(preference);
  if (!preferred || preferred === "any" || preferred === "either") return true;
  return normalize(status).includes(preferred);
}

function locationMatches(preference, currentUser, profile) {
  const preferred = normalize(preference);
  if (!preferred || preferred === "anywhere in pakistan" || preferred === "open to overseas pakistanis") {
    return true;
  }
  if (preferred === "same city") return normalize(profile.city) === normalize(currentUser.city);
  if (preferred === "same province") {
    return PROVINCE_BY_CITY[profile.city] && PROVINCE_BY_CITY[profile.city] === PROVINCE_BY_CITY[currentUser.city];
  }
  return true;
}

export function getBlockedProfileIds(interactions = [], currentUserId) {
  return new Set(
    interactions
      .filter((interaction) => interaction.actorId === currentUserId && interaction.action === "block")
      .map((interaction) => interaction.targetId),
  );
}

export function profileMatchesPreferences({ currentUser, profile, filters = {}, interactions = [], matches = [] }) {
  if (!currentUser || !profile || profile.id === currentUser.id) return false;
  if (currentUser.gender && profile.gender === currentUser.gender) return false;

  const dismissedIds = new Set(
    interactions
      .filter((interaction) => interaction.actorId === currentUser.id && DISMISSED_ACTIONS.has(interaction.action))
      .map((interaction) => interaction.targetId),
  );
  if (dismissedIds.has(profile.id)) return false;

  const matchedIds = new Set(
    matches
      .filter((match) => match.userId === currentUser.id)
      .map((match) => match.matchedUserId),
  );
  if (matchedIds.has(profile.id)) return false;

  const preferences = { ...(currentUser.preferences || {}), ...filters };
  const age = numberOrFallback(profile.age, 0);
  const ageMin = numberOrFallback(preferences.ageMin, 18);
  const ageMax = numberOrFallback(preferences.ageMax, 80);
  if (age && (age < ageMin || age > ageMax)) return false;

  if (!locationMatches(preferences.location, currentUser, profile)) return false;
  if (!statusMatches(preferences.maritalStatus, profile.maritalStatus)) return false;
  if (preferences.openToChildren === false && hasChildren(profile)) return false;
  if (preferences.verifiedOnly && !(profile.verification || []).length) return false;

  return true;
}

export function scoreProfile({ currentUser, profile, filters = {} }) {
  const preferences = { ...(currentUser.preferences || {}), ...filters };
  let score = Number(profile.compatibility || 60);

  if (locationMatches(preferences.location, currentUser, profile)) score += 8;
  if (statusMatches(preferences.maritalStatus, profile.maritalStatus)) score += 8;
  if (preferences.matrimonialGoal && profile.preferences?.matrimonialGoal === preferences.matrimonialGoal) {
    score += 12;
  }
  if (preferences.openToChildren === true && hasChildren(profile)) score += 5;
  if (preferences.prayerImportant && normalize(profile.prayer).includes("5 times")) score += 5;
  if (preferences.familyInvolvement && normalize(profile.familyType).includes("family")) score += 5;
  score += Math.min((profile.verification || []).length * 3, 9);

  return Math.max(1, Math.min(99, score));
}

export function getDiscoveryProfiles({ profiles = [], currentUser, currentUserId, interactions = [], matches = [], filters = {} }) {
  const resolvedUser = currentUser ? { ...currentUser, id: currentUser.id || currentUserId } : null;
  if (!resolvedUser) return [];

  return profiles
    .filter((profile) =>
      profileMatchesPreferences({
        currentUser: resolvedUser,
        profile,
        filters,
        interactions,
        matches,
      }),
    )
    .map((profile) => ({
      ...profile,
      matchScore: scoreProfile({ currentUser: resolvedUser, profile, filters }),
    }))
    .sort((left, right) => right.matchScore - left.matchScore);
}
