import { buildMessage, buildNotification } from "./repository";
import { supabase } from "../lib/supabase";

export const MAX_MESSAGE_LENGTH = 1000;

export function normalizeMessageText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

export function validateOutgoingMessage({ text, matchId, matches = [], currentUserId }) {
  const normalizedText = normalizeMessageText(text);

  if (!normalizedText) {
    return { ok: false, error: "Write a message first." };
  }

  if ([...normalizedText].length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer.` };
  }

  if (!matchId) {
    return { ok: false, error: "Open a match before messaging." };
  }

  const activeMatch = matches.find(
    (match) => match.id === matchId && match.userId === currentUserId,
  );

  if (!activeMatch) {
    return { ok: false, error: "This conversation is not available for your account." };
  }

  if (!activeMatch.matchedUserId || activeMatch.matchedUserId === currentUserId) {
    return { ok: false, error: "This match cannot receive messages." };
  }

  return { ok: true, text: normalizedText, match: activeMatch };
}

export function messageRowToModel(row, currentUserId) {
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

export function createMessageNotification({ message, senderName = "A match" }) {
  return {
    ...buildNotification({
      type: "message",
      title: `${senderName} sent you a message`,
    }),
    userId: message.receiverId,
  };
}

export function createChatService({ repository } = {}) {
  function createOutgoingMessage({ text, matchId, matches, currentUserId }) {
    const validation = validateOutgoingMessage({ text, matchId, matches, currentUserId });
    if (!validation.ok) return validation;

    const message = buildMessage({
      conversationId: validation.match.id,
      senderId: currentUserId,
      receiverId: validation.match.matchedUserId,
      text: validation.text,
    });

    return { ...validation, message };
  }

  return {
    createOutgoingMessage,

    async sendMessage(payload) {
      const result = createOutgoingMessage(payload);
      if (!result.ok) return result;
      await repository?.saveMessage?.(result.message);
      return result;
    },

    subscribeToIncomingMessages({ currentUserId, onMessage, onError }) {
      if (!supabase || !currentUserId) return () => {};

      const channel = supabase
        .channel(`messages:${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${currentUserId}`,
          },
          (payload) => onMessage?.(messageRowToModel(payload.new, currentUserId), payload),
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            onError?.(new Error(`Realtime chat subscription ${status.toLowerCase()}.`));
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
}
