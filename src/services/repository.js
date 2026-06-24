import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createInitialAppState } from "../data";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const STORAGE_KEY = "nikkah-noor:app-state:v1";
const DEFAULT_PROFILE_PHOTO =
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80";
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PROFILE_PUBLIC_COLUMNS = [
  "id",
  "handle",
  "full_name",
  "age",
  "gender",
  "city",
  "country",
  "marital_status",
  "profession",
  "education",
  "living_situation",
  "children",
  "income_range",
  "sect",
  "prayer",
  "quran",
  "family_type",
  "photo_privacy",
  "photo_url",
  "bio",
  "tags",
  "verification",
  "preferences",
  "stats",
  "compatibility",
  "created_at",
  "updated_at",
].join(",");

function nowIso() {
  return new Date().toISOString();
}

function safeClone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function localGet() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function localSet(value) {
  const serialized = JSON.stringify(value);
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, serialized);
}

function formatNameFromEmail(email = "") {
  const name = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!name) return "New Member";
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function profileFromAuthUser(authUser) {
  const email = authUser?.email || "";
  const name = authUser?.user_metadata?.full_name || formatNameFromEmail(email);
  const handleBase = email.split("@")[0]?.replace(/[^a-z0-9._-]/gi, ".").toLowerCase() || "member";

  return {
    id: authUser?.id || `local-${Date.now()}`,
    handle: `@${handleBase}.${String(authUser?.id || "local").slice(0, 4)}`,
    email,
    name,
    age: "",
    gender: "male",
    city: "Karachi",
    country: "Pakistan",
    phone: "",
    maritalStatus: "Divorced",
    profession: "",
    education: "",
    livingSituation: "With family",
    children: "No children",
    incomeRange: "Prefer not to disclose",
    sect: "Prefer not to say",
    prayer: "Prefer not to say",
    quran: "Prefer not to say",
    familyType: "Open to discussion",
    photoPrivacy: "Blur before mutual match",
    photo: DEFAULT_PROFILE_PHOTO,
    bio: "",
    tags: ["Email verified"],
    verification: ["Email"],
    preferences: {
      ageMin: "28",
      ageMax: "45",
      location: "Same city",
      maritalStatus: "Either",
      openToChildren: true,
    },
    stats: {
      views: 0,
      likes: 0,
      matches: 0,
      completion: 35,
    },
  };
}

function mergeAuthProfile(profile, authUser) {
  if (!authUser) return profile;
  return {
    ...profile,
    email: profile.email || authUser.email || "",
    name: profile.name || authUser.user_metadata?.full_name || formatNameFromEmail(authUser.email),
    handle: profile.handle || `@${authUser.email?.split("@")[0] || "member"}.${String(authUser.id).slice(0, 4)}`,
  };
}

function normalizeLoadedState(state, authUser) {
  const fallback = createInitialAppState();
  const currentUserId = authUser?.id || state.currentUserId || fallback.currentUserId;
  const authProfile = authUser ? profileFromAuthUser(authUser) : null;
  let profiles = state.profiles?.length ? state.profiles : fallback.profiles;

  if (authProfile && !profiles.some((profile) => profile.id === currentUserId)) {
    profiles = [authProfile, ...profiles];
  } else if (authUser) {
    profiles = profiles.map((profile) =>
      profile.id === currentUserId ? mergeAuthProfile(profile, authUser) : profile,
    );
  }

  const currentUser =
    profiles.find((profile) => profile.id === currentUserId) ||
    state.currentUser ||
    authProfile ||
    fallback.currentUser;
  const notifications = (state.notifications || fallback.notifications).map((notification) => ({
    ...notification,
    userId: notification.userId || notification.user_id || currentUserId,
    time: notification.time || notification.time_label || "Now",
    read: Boolean(notification.read),
  }));
  const reports = (state.reports || []).map(normalizeReport).filter(Boolean);

  return {
    ...fallback,
    ...state,
    currentUserId,
    profiles,
    currentUser,
    matches: state.matches || fallback.matches,
    messages: state.messages || fallback.messages,
    familyMembers: state.familyMembers || fallback.familyMembers,
    notifications,
    subscription: { ...fallback.subscription, ...(state.subscription || {}) },
    filters: { ...fallback.filters, ...(state.filters || {}) },
    reports,
    interactions: state.interactions || [],
  };
}

function rowToProfile(row) {
  return {
    id: row.id,
    handle: row.handle,
    email: row.email || "",
    name: row.full_name || formatNameFromEmail(row.email),
    age: String(row.age ?? ""),
    gender: row.gender,
    city: row.city,
    country: row.country || "Pakistan",
    phone: row.phone || "",
    maritalStatus: row.marital_status,
    profession: row.profession,
    education: row.education,
    livingSituation: row.living_situation,
    children: row.children,
    incomeRange: row.income_range,
    sect: row.sect,
    prayer: row.prayer,
    quran: row.quran,
    familyType: row.family_type,
    photoPrivacy: row.photo_privacy,
    photo: row.photo_url || DEFAULT_PROFILE_PHOTO,
    bio: row.bio,
    tags: row.tags || [],
    verification: row.verification || [],
    preferences: row.preferences || {},
    stats: row.stats || {},
    compatibility: row.compatibility,
    firstWifeConsent: row.first_wife_consent,
    plannedArrangement: row.planned_arrangement,
  };
}

function rowToInteraction(row) {
  return {
    id: row.id,
    actorId: row.actor_id,
    targetId: row.target_id,
    action: row.action,
    createdAt: row.created_at,
  };
}

function applyPrivateProfile(profile, row) {
  if (!row) return profile;
  return {
    ...profile,
    email: row.email || profile.email || "",
    phone: row.phone || profile.phone || "",
    firstWifeConsent: Boolean(row.first_wife_consent),
    plannedArrangement: row.planned_arrangement || profile.plannedArrangement || "",
  };
}

function profileToRow(profile) {
  return {
    id: profile.id,
    handle: profile.handle,
    full_name: profile.name,
    age: Number.parseInt(profile.age, 10) || null,
    gender: profile.gender,
    city: profile.city,
    country: profile.country || "Pakistan",
    marital_status: profile.maritalStatus,
    profession: profile.profession,
    education: profile.education,
    living_situation: profile.livingSituation,
    children: profile.children,
    income_range: profile.incomeRange,
    sect: profile.sect,
    prayer: profile.prayer,
    quran: profile.quran,
    family_type: profile.familyType,
    photo_privacy: profile.photoPrivacy,
    photo_url: profile.photo,
    bio: profile.bio,
    tags: profile.tags || [],
    verification: profile.verification || [],
    preferences: profile.preferences || {},
    stats: profile.stats || {},
    compatibility: profile.compatibility,
    updated_at: nowIso(),
  };
}

function privateProfileToRow(profile) {
  return {
    id: profile.id,
    email: profile.email || "",
    phone: profile.phone || "",
    first_wife_consent: Boolean(profile.firstWifeConsent),
    planned_arrangement: profile.plannedArrangement || "",
    updated_at: nowIso(),
  };
}

async function saveRemoteProfile(profile) {
  if (!supabase) return;
  const profileResult = await supabase.from("profiles").upsert(profileToRow(profile));
  if (profileResult.error) throw profileResult.error;

  const privateResult = await supabase.from("profile_private").upsert(privateProfileToRow(profile));
  if (privateResult.error) throw privateResult.error;
}

function rowToMatch(row) {
  return {
    id: row.id,
    userId: row.user_id,
    matchedUserId: row.matched_user_id,
    matchedAt: row.matched_at,
    unread: row.unread || 0,
  };
}

function matchToRow(match) {
  return {
    id: match.id,
    user_id: match.userId,
    matched_user_id: match.matchedUserId,
    matched_at: match.matchedAt || nowIso(),
    unread: match.unread || 0,
  };
}

function rowToMessage(row, currentUserId) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    from: row.sender_id === currentUserId ? "me" : "them",
    text: row.body,
    time: row.time_label || "Now",
    createdAt: row.created_at,
  };
}

function messageToRow(message) {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    receiver_id: message.receiverId,
    body: message.text,
    time_label: message.time,
    created_at: message.createdAt || nowIso(),
  };
}

function rowToNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    time: row.time_label || "Now",
    read: Boolean(row.read),
    createdAt: row.created_at,
  };
}

function pushTokenToRow(tokenRecord) {
  return {
    id: tokenRecord.id,
    user_id: tokenRecord.userId,
    token: tokenRecord.token,
    platform: tokenRecord.platform,
    device_name: tokenRecord.deviceName || "",
    enabled: tokenRecord.enabled !== false,
    updated_at: nowIso(),
  };
}

function normalizeReport(report) {
  if (!report?.id) return null;
  return {
    id: report.id,
    reporterId: report.reporterId || report.reporter_id,
    reportedUserId: report.reportedUserId || report.reported_user_id,
    reason: report.reason,
    notes: report.notes || "",
    createdAt: report.createdAt || report.created_at,
  };
}

function rowToReport(row) {
  return normalizeReport(row);
}

export function createRepository() {
  return {
    isRemote: isSupabaseConfigured,

    async load(authUser) {
      const localState = await localGet();

      if (!supabase) {
        return normalizeLoadedState(localState || createInitialAppState(), authUser);
      }

      try {
        const fallback = normalizeLoadedState(localState || createInitialAppState(), authUser);
        const loadUserId = authUser?.id || fallback.currentUserId;
        const [
          profilesResult,
          privateProfileResult,
          matchesResult,
          messagesResult,
          familyResult,
          notificationsResult,
          reportsResult,
          interactionsResult,
        ] = await Promise.all([
          supabase.from("profiles").select(PROFILE_PUBLIC_COLUMNS).order("created_at", { ascending: true }),
          authUser
            ? supabase.from("profile_private").select("*").eq("id", authUser.id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          supabase.from("matches").select("*").order("matched_at", { ascending: false }),
          supabase.from("messages").select("*").order("created_at", { ascending: true }),
          supabase.from("family_members").select("*").order("created_at", { ascending: true }),
          supabase.from("notifications").select("*").order("created_at", { ascending: false }),
          supabase.from("reports").select("*").order("created_at", { ascending: false }),
          supabase.from("interactions").select("*").order("created_at", { ascending: false }),
        ]);

        const errors = [
          profilesResult.error,
          privateProfileResult.error,
          matchesResult.error,
          messagesResult.error,
          familyResult.error,
          notificationsResult.error,
          reportsResult.error,
          interactionsResult.error,
        ].filter(Boolean);

        if (errors.length) {
          console.warn("Supabase load failed; using local state", errors[0].message);
          return fallback;
        }

        let profiles = (profilesResult.data || []).map(rowToProfile);
        const authProfile = authUser ? profileFromAuthUser(authUser) : null;

        if (authProfile && !profiles.some((profile) => profile.id === authProfile.id)) {
          profiles = [authProfile, ...profiles];
          await saveRemoteProfile(authProfile);
        } else if (authProfile) {
          profiles = profiles.map((profile) =>
            profile.id === authProfile.id
              ? applyPrivateProfile(mergeAuthProfile(profile, authUser), privateProfileResult.data)
              : profile,
          );
        }

        const state = normalizeLoadedState({
          ...fallback,
          profiles: profiles.length ? profiles : fallback.profiles,
          matches: (matchesResult.data || []).map(rowToMatch),
          messages: (messagesResult.data || []).map((row) =>
            rowToMessage(row, loadUserId),
          ),
          familyMembers: (familyResult.data || []).map((row) => ({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            relation: row.relation,
            phone: row.phone,
            permission: row.permission,
          })),
          notifications: (notificationsResult.data || []).map(rowToNotification),
          reports: (reportsResult.data || []).map(rowToReport),
          interactions: (interactionsResult.data || []).map(rowToInteraction),
        }, authUser);

        return state;
      } catch (error) {
        console.warn("Supabase unavailable; using local state", error.message);
        return normalizeLoadedState(localState || createInitialAppState(), authUser);
      }
    },

    async persist(state) {
      if (supabase) return;
      await localSet(state);
    },

    async saveProfile(profile) {
      if (!supabase) return;
      await saveRemoteProfile(profile);
    },

    async saveMatch(match) {
      if (!supabase) return;
      const { error } = await supabase.from("matches").upsert(matchToRow(match));
      if (error) throw error;
    },

    async saveMessage(message) {
      if (!supabase) return;
      const { error } = await supabase.from("messages").insert(messageToRow(message));
      if (error) throw error;
    },

    async saveFamilyMember(member) {
      if (!supabase) return;
      const { error } = await supabase.from("family_members").upsert({
        id: member.id,
        user_id: member.userId,
        name: member.name,
        relation: member.relation,
        phone: member.phone,
        permission: member.permission,
        updated_at: nowIso(),
      });
      if (error) throw error;
    },

    async saveNotification(notification, userId) {
      if (!supabase) return;
      const { error } = await supabase.from("notifications").upsert({
        id: notification.id,
        user_id: userId,
        type: notification.type,
        title: notification.title,
        time_label: notification.time,
        read: notification.read,
        created_at: nowIso(),
      });
      if (error) throw error;
    },

    async savePushToken(tokenRecord) {
      if (!supabase) return;
      const { error } = await supabase.from("push_tokens").upsert(pushTokenToRow(tokenRecord));
      if (error) throw error;
    },

    async saveReport(report) {
      if (!supabase) return;
      const { error } = await supabase.from("reports").insert({
        id: report.id,
        reporter_id: report.reporterId,
        reported_user_id: report.reportedUserId,
        reason: report.reason,
        notes: report.notes,
        created_at: report.createdAt || nowIso(),
      });
      if (error) throw error;
    },

    async requestAccountDeletion(request) {
      if (!supabase) return;
      const { error } = await supabase.from("account_deletion_requests").upsert({
        id: request.id,
        user_id: request.userId,
        reason: request.reason,
        status: "pending",
        requested_at: request.requestedAt || nowIso(),
      });
      if (error) throw error;
    },

    async saveInteraction(interaction) {
      if (!supabase) return;
      const { error } = await supabase.from("interactions").insert({
        id: interaction.id,
        actor_id: interaction.actorId,
        target_id: interaction.targetId,
        action: interaction.action,
        created_at: interaction.createdAt || nowIso(),
      });
      if (error) throw error;
    },

    async deleteMatchesWithUser(userId, targetId) {
      if (!supabase) return;
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("user_id", userId)
        .eq("matched_user_id", targetId);
      if (error) throw error;
    },

    subscribeToProfileUpdates({ onProfile, onError }) {
      if (!supabase) return () => {};

      const channel = supabase
        .channel("profiles:updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
          },
          (payload) => onProfile?.(rowToProfile(payload.new), payload),
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            onError?.(new Error(`Realtime profile subscription ${status.toLowerCase()}.`));
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    },

    async uploadProfilePhoto(userId, asset) {
      if (!supabase) return asset.uri;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const contentType = asset.mimeType || blob.type || "image/jpeg";
      if (!ALLOWED_PROFILE_PHOTO_TYPES.has(contentType)) {
        throw new Error("Only JPG, PNG, or WEBP profile images are allowed.");
      }
      if (blob.size > MAX_PROFILE_PHOTO_BYTES) {
        throw new Error("Profile image must be 5MB or smaller.");
      }

      const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
      const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      const path = `${userId}/${randomId}.${extension}`;

      const { error } = await supabase.storage
        .from("profile-photos")
        .upload(path, blob, {
          cacheControl: "3600",
          contentType,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      return data.publicUrl;
    },

    async resetLocal(authUser) {
      const state = normalizeLoadedState(safeClone(createInitialAppState()), authUser);
      await localSet(state);
      return state;
    },
  };
}

export function buildMatchFromProfile(currentUserId, profile) {
  return {
    id: `match-${profile.id}-${Date.now()}`,
    userId: currentUserId,
    matchedUserId: profile.id,
    matchedAt: nowIso(),
    unread: 0,
  };
}

export function buildMessage({ conversationId, senderId, receiverId, text, from = "me" }) {
  return {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    receiverId,
    from,
    text,
    time: "Now · Sent",
    createdAt: nowIso(),
  };
}

export function buildNotification({ type, title }) {
  return {
    id: `note-${Date.now()}`,
    type,
    title,
    time: "Now",
    read: false,
  };
}
