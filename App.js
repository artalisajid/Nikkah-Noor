import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  buildMatchFromProfile,
  buildNotification,
  createRepository,
} from "./src/services/repository";
import { createChatService, createMessageNotification } from "./src/services/chat";
import { createNotificationService } from "./src/services/notifications";
import {
  getCurrentSession,
  onAuthStateChange,
  resendSignupOtp,
  sendPasswordReset,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updateEmailAddress,
  updatePassword,
  verifyEmailOtp,
} from "./src/services/auth";
import { getBlockedProfileIds, getDiscoveryProfiles } from "./src/services/matching";
import {
  ChatScreen,
  DetailsModal,
  EmailAuthScreen,
  EmailOtpScreen,
  FamilyScreen,
  FiltersModal,
  ForgotPasswordScreen,
  GenderScreen,
  HomeScreen,
  LegalScreen,
  MatchModal,
  MatchesScreen,
  NotificationsScreen,
  PremiumScreen,
  PrivacyCenterScreen,
  ProfileScreen,
  ResetPasswordScreen,
  SafetyScreen,
  SettingsScreen,
  WelcomeScreen,
} from "./src/screens";
import { colors, shadow, type } from "./src/theme";

const repository = createRepository();
const chatService = createChatService({ repository });
const notificationService = createNotificationService({ repository });

export default function App() {
  const { width } = useWindowDimensions();
  const [activeScreen, setActiveScreen] = useState("welcome");
  const [appState, setAppState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [syncLabel, setSyncLabel] = useState("Loading");
  const [profileIndex, setProfileIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState("Push notifications are not enabled.");
  const saveTimer = useRef(null);

  async function loadUserApp(user) {
    if (!user) return null;
    setLoading(true);
    try {
      const state = await repository.load(user);
      setAppState(state);
      setSyncLabel(repository.isRemote ? "Supabase connected" : "Local demo mode");
      return state;
    } catch (error) {
      console.warn(error);
      setSyncLabel("Could not load Supabase data");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    getCurrentSession()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession?.user) {
          return loadUserApp(currentSession.user).then(() => {
            if (mounted) setActiveScreen("home");
          });
        }
        setSyncLabel(repository.isRemote ? "Supabase ready" : "Local demo mode");
        setLoading(false);
        return null;
      })
      .catch((error) => {
        console.warn(error);
        if (!mounted) return;
        setSyncLabel(error.message);
        setLoading(false);
      });

    const subscription = onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setLoading(false);
        setActiveScreen("resetPassword");
        return;
      }
      if (event === "SIGNED_OUT") {
        setAppState(null);
        setSelectedMatchId(null);
        setActiveScreen("welcome");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!appState || loading) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      repository.persist(appState).catch((error) => console.warn(error));
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [appState, loading]);

  useEffect(() => {
    const currentUserId = appState?.currentUserId;
    if (!currentUserId) return undefined;

    return chatService.subscribeToIncomingMessages({
      currentUserId,
      onMessage: (message) => {
        setAppState((state) => {
          if (!state || state.messages.some((item) => item.id === message.id)) return state;
          const sender = state.profiles.find((profile) => profile.id === message.senderId);
          const notification = createMessageNotification({
            message,
            senderName: sender?.name || "A match",
          });

          repository
            .saveNotification(notification, currentUserId)
            .catch((error) => console.warn("Realtime notification sync failed", error.message));

          return {
            ...state,
            messages: [...state.messages, message],
            matches: state.matches.map((match) =>
              match.id === message.conversationId && match.userId === currentUserId
                ? { ...match, unread: (match.unread || 0) + 1 }
                : match,
            ),
            notifications: [notification, ...state.notifications],
          };
        });
      },
      onError: (error) => {
        console.warn(error.message);
        setSyncLabel("Realtime chat is reconnecting");
      },
    });
  }, [appState?.currentUserId]);

  useEffect(() => {
    const currentUserId = appState?.currentUserId;
    if (!currentUserId) return undefined;

    return notificationService.subscribeToNotifications({
      currentUserId,
      onNotification: (notification) => {
        setAppState((state) => {
          if (!state || state.notifications.some((item) => item.id === notification.id)) return state;
          return {
            ...state,
            notifications: [notification, ...state.notifications],
          };
        });
      },
      onError: (error) => {
        console.warn(error.message);
        setNotificationStatus("Realtime notifications are reconnecting.");
      },
    });
  }, [appState?.currentUserId]);

  useEffect(() => {
    if (!appState?.currentUserId) return undefined;

    return repository.subscribeToProfileUpdates({
      onProfile: (profile) => {
        setAppState((state) => {
          if (!state) return state;
          return {
            ...state,
            currentUser: profile.id === state.currentUserId ? { ...state.currentUser, ...profile } : state.currentUser,
            profiles: state.profiles.map((item) => (item.id === profile.id ? { ...item, ...profile } : item)),
          };
        });
      },
      onError: (error) => {
        console.warn(error.message);
        setSyncLabel("Realtime profile updates are reconnecting");
      },
    });
  }, [appState?.currentUserId]);

  const currentUser = appState?.currentUser;
  const isAuthScreen = [
    "welcome",
    "authLogin",
    "authSignup",
    "emailOtp",
    "forgotPassword",
    "resetPassword",
  ].includes(activeScreen);
  const discoveryProfiles = useMemo(() => {
    if (!appState) return [];
    return getDiscoveryProfiles({
      profiles: appState.profiles,
      currentUser,
      currentUserId: appState.currentUserId,
      interactions: appState.interactions,
      matches: appState.matches,
      filters: appState.filters,
    });
  }, [appState, currentUser]);

  const activeProfile =
    discoveryProfiles.length > 0
      ? discoveryProfiles[profileIndex % discoveryProfiles.length]
      : null;

  function navigate(screen) {
    const signedIn = Boolean(session?.user || appState?.currentUserId);
    const authOnlyScreens = ["welcome", "authLogin", "authSignup", "emailOtp", "forgotPassword"];
    setActiveScreen(signedIn && authOnlyScreens.includes(screen) ? "home" : screen);
    setFiltersOpen(false);
    setDetailsOpen(false);
    setMatchOpen(false);
  }

  function openChat(matchId) {
    setSelectedMatchId(matchId || null);
    navigate("chat");
  }

  async function handleEmailSignup(credentials) {
    const data = await signUpWithEmail(credentials);
    setPendingEmail(credentials.email.trim().toLowerCase());
    setSyncLabel("Verification code sent to email");
    if (data.session?.user) {
      setSession(data.session);
      await loadUserApp(data.session.user);
      navigate("gender");
      return data;
    }
    navigate("emailOtp");
    return data;
  }

  async function handleEmailOtp(payload) {
    const data = await verifyEmailOtp(payload);
    const nextSession = data.session;
    if (nextSession?.user) {
      setSession(nextSession);
      await loadUserApp(nextSession.user);
      setSyncLabel("Email verified");
      navigate("gender");
    }
    return data;
  }

  async function handleEmailLogin(credentials) {
    const data = await signInWithEmail(credentials);
    if (data.session?.user) {
      setSession(data.session);
      await loadUserApp(data.session.user);
      setSyncLabel("Signed in");
      navigate("home");
    }
    return data;
  }

  async function handlePasswordReset(email) {
    await sendPasswordReset(email);
    setSyncLabel("Password reset email sent");
  }

  async function handlePasswordUpdate(password) {
    await updatePassword(password);
    setSyncLabel("Password updated");
    const currentSession = session || (await getCurrentSession());
    if (currentSession?.user) {
      setSession(currentSession);
      await loadUserApp(currentSession.user);
      navigate("home");
    } else {
      navigate("authLogin");
    }
  }

  async function handleEmailUpdate(email) {
    const normalizedEmail = email.trim().toLowerCase();
    await updateEmailAddress(normalizedEmail);
    updateCurrentUser({ pendingEmail: normalizedEmail });
    setSyncLabel("Email update confirmation sent");
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setAppState(null);
    setPendingEmail("");
    setSelectedMatchId(null);
    setProfileIndex(0);
    setFiltersOpen(false);
    setDetailsOpen(false);
    setMatchOpen(false);
    setSyncLabel(repository.isRemote ? "Supabase ready" : "Local demo mode");
    setActiveScreen("welcome");
  }

  function updateCurrentUser(patch) {
    setAppState((state) => {
      const updatedUser = {
        ...state.currentUser,
        ...patch,
        preferences: {
          ...(state.currentUser.preferences || {}),
          ...(patch.preferences || {}),
        },
        stats: {
          ...(state.currentUser.stats || {}),
          ...(patch.stats || {}),
        },
      };
      repository.saveProfile(updatedUser).catch((error) => {
        console.warn("Profile sync failed", error.message);
        setSyncLabel("Saved locally");
      });
      return {
        ...state,
        currentUser: updatedUser,
        profiles: state.profiles.map((profile) =>
          profile.id === updatedUser.id ? updatedUser : profile,
        ),
      };
    });
    setSyncLabel(repository.isRemote ? "Autosaved to Supabase" : "Autosaved locally");
  }

  function updateFilters(patch) {
    setAppState((state) => ({
      ...state,
      filters: { ...state.filters, ...patch },
    }));
  }

  function updateSubscription(patch) {
    setAppState((state) => ({
      ...state,
      subscription: { ...state.subscription, ...patch },
    }));
  }

  function upsertFamilyMember(member) {
    setAppState((state) => {
      const nextMember = {
        ...member,
        id: member.id || `family-${Date.now()}`,
        userId: state.currentUserId,
      };
      repository.saveFamilyMember(nextMember).catch((error) => {
        console.warn("Family sync failed", error.message);
      });
      return {
        ...state,
        familyMembers: [
          ...state.familyMembers.filter((item) => item.id !== nextMember.id),
          nextMember,
        ],
      };
    });
    setSyncLabel(repository.isRemote ? "Family saved to Supabase" : "Family saved locally");
  }

  function handleSwipe(type) {
    if (!activeProfile || !appState) return;
    if (type === "block") {
      blockProfile(activeProfile);
      setProfileIndex((current) => current + 1);
      return;
    }
    const action = type === "super" ? "super_like" : type;
    const interaction = {
      id: `interaction-${Date.now()}`,
      actorId: appState.currentUserId,
      targetId: activeProfile.id,
      action,
      createdAt: new Date().toISOString(),
    };

    repository.saveInteraction(interaction).catch((error) => {
      console.warn("Interaction sync failed", error.message);
    });

    setAppState((state) => ({
      ...state,
      interactions: [...state.interactions, interaction],
    }));

    if (type === "like" || type === "super") {
      const match = buildMatchFromProfile(appState.currentUserId, activeProfile);
      const notification = {
        ...buildNotification({
          type: "match",
          title: `It's a match with ${activeProfile.name}`,
        }),
        userId: appState.currentUserId,
      };
      repository.saveMatch(match).catch((error) => console.warn("Match sync failed", error.message));
      repository
        .saveNotification(notification, appState.currentUserId)
        .catch((error) => console.warn("Notification sync failed", error.message));
      setSelectedMatchId(match.id);
      setAppState((state) => ({
        ...state,
        matches: [match, ...state.matches],
        notifications: [notification, ...state.notifications],
      }));
      setMatchOpen(true);
    }

    setProfileIndex((current) => current + 1);
  }

  function blockProfile(profile) {
    if (!profile || !appState) return;
    const interaction = {
      id: `interaction-${Date.now()}`,
      actorId: appState.currentUserId,
      targetId: profile.id,
      action: "block",
      createdAt: new Date().toISOString(),
    };
    const notification = {
      ...buildNotification({
        type: "system",
        title: `${profile.name} was blocked`,
      }),
      userId: appState.currentUserId,
    };

    repository.saveInteraction(interaction).catch((error) => {
      console.warn("Block sync failed", error.message);
    });
    repository
      .deleteMatchesWithUser(appState.currentUserId, profile.id)
      .catch((error) => console.warn("Block cleanup failed", error.message));
    repository
      .saveNotification(notification, appState.currentUserId)
      .catch((error) => console.warn("Notification sync failed", error.message));

    setAppState((state) => ({
      ...state,
      interactions: [...state.interactions, interaction],
      matches: state.matches.filter(
        (match) => !(match.userId === state.currentUserId && match.matchedUserId === profile.id),
      ),
      notifications: [notification, ...state.notifications],
    }));
    setSelectedMatchId(null);
    setSyncLabel("Profile blocked and hidden from matching");
  }

  function handleDetailsLike() {
    setDetailsOpen(false);
    handleSwipe("like");
  }

  function sendMessage(text, matchId) {
    if (!appState) return false;
    const result = chatService.createOutgoingMessage({
      text,
      matchId,
      matches: appState.matches,
      currentUserId: appState.currentUserId,
    });

    if (!result.ok) {
      setSyncLabel(result.error);
      return false;
    }

    repository
      .saveMessage(result.message)
      .then(() =>
        notificationService.sendMessagePush({
          message: result.message,
          senderName: currentUser?.name || "A match",
        }),
      )
      .then((pushResult) => {
        if (pushResult && !pushResult.ok && pushResult.status !== "local_mode") {
          console.warn("Push dispatch skipped", pushResult.message);
        }
      })
      .catch((error) => {
        console.warn("Message sync failed", error.message);
        setSyncLabel("Message saved locally while chat reconnects");
      });

    setAppState((state) => ({
      ...state,
      messages: [...state.messages, result.message],
      matches: state.matches.map((match) =>
        match.id === result.match.id ? { ...match, unread: 0 } : match,
      ),
    }));
    setSyncLabel(repository.isRemote ? "Message sent through Supabase" : "Message sent locally");
    return true;
  }

  async function registerPushNotifications() {
    if (!appState?.currentUserId) {
      setNotificationStatus("Sign in before enabling notifications.");
      return null;
    }

    const result = await notificationService.registerPushToken(appState.currentUserId);
    setNotificationStatus(result.message);

    const notification = notificationService.buildInAppNotification({
      userId: appState.currentUserId,
      type: result.ok ? "system" : "activity",
      title: result.ok ? "Push notifications enabled" : result.message,
    });

    repository
      .saveNotification(notification, appState.currentUserId)
      .catch((error) => console.warn("Notification sync failed", error.message));

    setAppState((state) =>
      state
        ? {
            ...state,
            notifications: [notification, ...state.notifications],
          }
        : state,
    );

    return result;
  }

  function submitReport(reason, notes) {
    if (!appState || !activeProfile) return;
    const report = {
      id: `report-${Date.now()}`,
      reporterId: appState.currentUserId,
      reportedUserId: activeProfile.id,
      reason,
      notes,
      createdAt: new Date().toISOString(),
    };
    repository.saveReport(report).catch((error) => {
      console.warn("Report sync failed", error.message);
    });
    const notification = {
      ...buildNotification({
        type: "system",
        title: "Your confidential report was submitted",
      }),
      userId: appState.currentUserId,
    };
    setAppState((state) => ({
      ...state,
      reports: [report, ...state.reports],
      notifications: [notification, ...state.notifications],
    }));
    setSyncLabel(repository.isRemote ? "Report sent to Supabase" : "Report saved locally");
  }

  function requestAccountDeletion(reason) {
    if (!appState) return;
    const request = {
      id: `delete-${appState.currentUserId}`,
      userId: appState.currentUserId,
      reason,
      requestedAt: new Date().toISOString(),
    };
    repository.requestAccountDeletion(request).catch((error) => {
      console.warn("Account deletion request failed", error.message);
    });
    setSyncLabel(repository.isRemote ? "Deletion request sent to Supabase" : "Deletion request saved locally");
  }

  async function uploadProfilePhoto(asset) {
    try {
      const photoUrl = await repository.uploadProfilePhoto(appState.currentUserId, asset);
      setSyncLabel(repository.isRemote ? "Image uploaded to Supabase" : "Image saved locally");
      return photoUrl;
    } catch (error) {
      console.warn("Image upload failed", error.message);
      setSyncLabel("Image saved locally");
      return asset.uri;
    }
  }

  function resetDemo() {
    repository.resetLocal(session?.user).then((state) => {
      setAppState(state);
      setProfileIndex(0);
      setSelectedMatchId(null);
      setSyncLabel("Demo reset");
    });
  }

  if (loading || (!isAuthScreen && (!appState || !currentUser))) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.gold} />
          <Text style={type.h3}>Loading Nikkah Noor</Text>
        </View>
      </SafeAreaView>
    );
  }

  const screenProps = {
    active: activeScreen,
    navigate,
    syncLabel,
    session,
    pendingEmail,
    appState,
    currentUser,
    currentUserId: appState?.currentUserId,
    profiles: appState?.profiles || [],
    matches: (appState?.matches || []).filter((match) => match.userId === appState?.currentUserId),
    messages: (appState?.messages || []).filter(
      (message) => message.senderId === appState?.currentUserId || message.receiverId === appState?.currentUserId,
    ),
    familyMembers: (appState?.familyMembers || []).filter((member) => member.userId === appState?.currentUserId),
    notifications: (appState?.notifications || []).filter((notification) => notification.userId === appState?.currentUserId),
    notificationStatus,
    subscription: appState?.subscription || {},
    filters: appState?.filters || {},
    reports: (appState?.reports || []).filter((report) => report.reporterId === appState?.currentUserId),
    selectedMatchId,
    updateCurrentUser,
    updateFilters,
    updateSubscription,
    upsertFamilyMember,
    sendMessage,
    registerPushNotifications,
    submitReport,
    requestAccountDeletion,
    uploadProfilePhoto,
    resetDemo,
    openChat,
    blockProfile,
    signUpWithEmail: handleEmailSignup,
    signInWithEmail: handleEmailLogin,
    verifyEmailOtp: handleEmailOtp,
    resendSignupOtp,
    sendPasswordReset: handlePasswordReset,
    updateEmailAddress: handleEmailUpdate,
    updatePassword: handlePasswordUpdate,
    signOut: handleSignOut,
    openFilters: () => setFiltersOpen(true),
    openDetails: () => setDetailsOpen(true),
    profile: activeProfile,
    onSwipe: handleSwipe,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={[styles.stage, width > 700 && styles.desktopStage]}>
        <View style={[styles.appFrame, width > 700 && styles.desktopFrame]}>
          {activeScreen === "welcome" && <WelcomeScreen {...screenProps} />}
          {activeScreen === "authSignup" && <EmailAuthScreen {...screenProps} mode="signup" />}
          {activeScreen === "authLogin" && <EmailAuthScreen {...screenProps} mode="login" />}
          {activeScreen === "emailOtp" && <EmailOtpScreen {...screenProps} />}
          {activeScreen === "forgotPassword" && <ForgotPasswordScreen {...screenProps} />}
          {activeScreen === "resetPassword" && <ResetPasswordScreen {...screenProps} />}
          {activeScreen === "gender" && <GenderScreen {...screenProps} />}
          {activeScreen === "profile" && <ProfileScreen {...screenProps} />}
          {activeScreen === "home" && <HomeScreen {...screenProps} />}
          {activeScreen === "matches" && <MatchesScreen {...screenProps} />}
          {activeScreen === "chat" && <ChatScreen {...screenProps} />}
          {activeScreen === "settings" && <SettingsScreen {...screenProps} />}
          {activeScreen === "premium" && <PremiumScreen {...screenProps} />}
          {activeScreen === "safety" && <SafetyScreen {...screenProps} />}
          {activeScreen === "family" && <FamilyScreen {...screenProps} />}
          {activeScreen === "privacy" && <PrivacyCenterScreen {...screenProps} />}
          {activeScreen === "legal" && <LegalScreen {...screenProps} />}
          {activeScreen === "notifications" && <NotificationsScreen {...screenProps} />}

          {appState ? (
            <FiltersModal
              visible={filtersOpen}
              filters={appState.filters}
              updateFilters={updateFilters}
              onClose={() => setFiltersOpen(false)}
            />
          ) : null}
          {appState && activeProfile ? (
            <DetailsModal
              visible={detailsOpen}
              onClose={() => setDetailsOpen(false)}
              profile={activeProfile}
              onLike={handleDetailsLike}
              onBlock={() => {
                setDetailsOpen(false);
                handleSwipe("block");
              }}
            />
          ) : null}
          {appState ? (
            <MatchModal
              visible={matchOpen}
              onClose={() => setMatchOpen(false)}
              navigate={(screen) => navigate(screen)}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  stage: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  desktopStage: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#080808",
  },
  appFrame: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  desktopFrame: {
    maxWidth: 430,
    maxHeight: 900,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    ...shadow.card,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
});
