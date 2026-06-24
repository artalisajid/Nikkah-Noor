import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { buildNotification } from "./repository";

const EXPO_PUSH_TOKEN_PATTERN = /^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/;

export function validatePushToken(token) {
  return EXPO_PUSH_TOKEN_PATTERN.test(String(token || ""));
}

function getProjectId() {
  return (
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.manifest2?.extra?.eas?.projectId ||
    ""
  );
}

export function normalizeNotification(notification, userId) {
  return {
    ...notification,
    userId: notification.userId || userId,
    read: Boolean(notification.read),
    time: notification.time || "Now",
  };
}

export function notificationRowToModel(row) {
  return normalizeNotification(
    {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      time: row.time_label || "Now",
      read: row.read,
      createdAt: row.created_at,
    },
    row.user_id,
  );
}

export function createNotificationService({ repository } = {}) {
  return {
    buildInAppNotification({ userId, type = "system", title }) {
      return normalizeNotification(
        {
          ...buildNotification({ type, title }),
          userId,
        },
        userId,
      );
    },

    async saveInAppNotification(notification) {
      const normalized = normalizeNotification(notification, notification.userId);
      await repository?.saveNotification?.(normalized, normalized.userId);
      return normalized;
    },

    async registerPushToken(userId) {
      if (!userId) {
        return {
          ok: false,
          status: "missing_user",
          message: "Sign in before enabling push notifications.",
        };
      }

      if (Platform.OS === "web") {
        return {
          ok: false,
          status: "unsupported_web",
          message: "Browser testing uses in-app notifications. Native push tokens require an iOS or Android build.",
        };
      }

      try {
        const currentPermission = await Notifications.getPermissionsAsync();
        let finalStatus = currentPermission.status;

        if (currentPermission.status !== "granted") {
          const requestedPermission = await Notifications.requestPermissionsAsync();
          finalStatus = requestedPermission.status;
        }

        if (finalStatus !== "granted") {
          return {
            ok: false,
            status: "permission_denied",
            message: "Notification permission was not granted on this device.",
          };
        }

        const projectId = getProjectId();
        if (!projectId) {
          return {
            ok: false,
            status: "missing_project_id",
            message: "Add an EAS projectId before enabling public push delivery.",
          };
        }

        const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenResponse.data;

        if (!validatePushToken(token)) {
          return {
            ok: false,
            status: "invalid_token",
            message: "Expo returned an invalid push token format.",
          };
        }

        const tokenRecord = {
          id: `push-${userId}-${Platform.OS}`,
          userId,
          token,
          platform: Platform.OS,
          deviceName: Constants.deviceName || Platform.OS,
          enabled: true,
        };

        await repository?.savePushToken?.(tokenRecord);

        return {
          ok: true,
          status: "registered",
          message: "Push notifications are enabled for this device.",
          token,
        };
      } catch (error) {
        return {
          ok: false,
          status: "failed",
          message: error.message || "Could not register push notifications.",
        };
      }
    },

    async scheduleLocalNotification({ title, body }) {
      if (Platform.OS === "web") {
        return {
          ok: false,
          status: "unsupported_web",
          message: "Local push notifications are available in native builds.",
        };
      }

      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });

      return { ok: true, status: "scheduled", message: "Local notification scheduled." };
    },

    async sendMessagePush({ message, senderName }) {
      if (!supabase) {
        return { ok: false, status: "local_mode", message: "Supabase is not configured." };
      }

      const { error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          receiverId: message.receiverId,
          conversationId: message.conversationId,
          messageId: message.id,
          title: `${senderName || "A match"} sent you a message`,
          body: "Open Nikkah Noor to read the message.",
        },
      });

      if (error) {
        return {
          ok: false,
          status: "dispatch_failed",
          message: error.message || "Push dispatch failed.",
        };
      }

      return { ok: true, status: "dispatch_requested", message: "Push dispatch requested." };
    },

    subscribeToNotifications({ currentUserId, onNotification, onError }) {
      if (!supabase || !currentUserId) return () => {};

      const channel = supabase
        .channel(`notifications:${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload) => onNotification?.(notificationRowToModel(payload.new), payload),
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            onError?.(new Error(`Realtime notification subscription ${status.toLowerCase()}.`));
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
