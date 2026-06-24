import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_TITLE_LENGTH = 80;
const MAX_BODY_LENGTH = 180;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Function is missing Supabase environment variables" }, 500);
  }

  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing user authorization" }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userResult, error: userError } = await userClient.auth.getUser();

  if (userError || !userResult.user) {
    return jsonResponse({ error: "Invalid user authorization" }, 401);
  }

  const payload = await request.json().catch(() => ({}));
  const receiverId = cleanText(payload.receiverId, 80);
  const conversationId = cleanText(payload.conversationId, 120);
  const messageId = cleanText(payload.messageId, 120);
  const title = cleanText(payload.title, MAX_TITLE_LENGTH) || "New Nikkah Noor message";
  const body = cleanText(payload.body, MAX_BODY_LENGTH) || "Open Nikkah Noor to read the message.";

  if (!receiverId || !conversationId || !messageId) {
    return jsonResponse({ error: "receiverId, conversationId, and messageId are required" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: message, error: messageError } = await admin
    .from("messages")
    .select("id, conversation_id, sender_id, receiver_id")
    .eq("id", messageId)
    .maybeSingle();

  if (messageError) {
    return jsonResponse({ error: "Could not verify message" }, 500);
  }

  if (
    !message ||
    message.sender_id !== userResult.user.id ||
    message.receiver_id !== receiverId ||
    message.conversation_id !== conversationId
  ) {
    return jsonResponse({ error: "Message is not eligible for push dispatch" }, 403);
  }

  const { data: tokenRows, error: tokenError } = await admin
    .from("push_tokens")
    .select("token")
    .eq("user_id", receiverId)
    .eq("enabled", true);

  if (tokenError) {
    return jsonResponse({ error: "Could not load push tokens" }, 500);
  }

  const tokens = [...new Set((tokenRows || []).map((row) => row.token).filter(Boolean))];
  if (tokens.length === 0) {
    return jsonResponse({ sent: 0, skipped: "receiver_has_no_push_tokens" });
  }

  const expoPayload = tokens.map((to) => ({
    to,
    sound: "default",
    title,
    body,
    data: { conversationId, messageId },
  }));

  const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expoPayload),
  });

  const expoResult = await expoResponse.json().catch(() => ({}));

  if (!expoResponse.ok) {
    return jsonResponse({ error: "Expo push dispatch failed", detail: expoResult }, 502);
  }

  return jsonResponse({ sent: tokens.length, result: expoResult });
});
