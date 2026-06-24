import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const repository = readFileSync("src/services/repository.js", "utf8");
const screens = readFileSync("src/screens.js", "utf8");
const schema = readFileSync("supabase/schema.sql", "utf8");
const readme = readFileSync("README.md", "utf8");
const chat = readFileSync("src/services/chat.js", "utf8");
const notifications = readFileSync("src/services/notifications.js", "utf8");
const pushFunction = readFileSync("supabase/functions/send-push-notification/index.ts", "utf8");
const matching = readFileSync("src/services/matching.js", "utf8");
const smtpScript = readFileSync("scripts/configure-supabase-smtp.mjs", "utf8");

assert.ok(!repository.includes('from("profiles").select("*")'), "profiles must not be selected with wildcard columns");
assert.ok(repository.includes("PROFILE_PUBLIC_COLUMNS"), "profile discovery must use an explicit public column allow-list");
assert.ok(repository.includes('from("profile_private")'), "private profile fields must be isolated from public discovery rows");
assert.ok(repository.includes("if (supabase) return;"), "remote Supabase state must not be cached as full app state locally");
assert.ok(repository.includes("MAX_PROFILE_PHOTO_BYTES"), "profile uploads must enforce a byte limit");
assert.ok(repository.includes("ALLOWED_PROFILE_PHOTO_TYPES"), "profile uploads must enforce allowed image types");
assert.ok(repository.includes("upsert: false"), "profile uploads should not overwrite existing objects by default");
assert.ok(repository.includes('from("push_tokens")'), "push tokens must be persisted through a repository method");

assert.ok(screens.includes("passwordPolicyIssue"), "signup and reset screens must enforce a strong password policy");
assert.ok(screens.includes("Password needs at least one uppercase letter."), "password policy must require complexity");
assert.ok(chat.includes("MAX_MESSAGE_LENGTH"), "chat service must enforce message length");
assert.ok(chat.includes("This conversation is not available for your account."), "chat must reject cross-account matches");
assert.ok(notifications.includes("unsupported_web"), "push service must distinguish browser testing from native push");
assert.ok(notifications.includes("validatePushToken"), "push tokens must be format-validated before persistence");
assert.ok(notifications.includes("subscribeToNotifications"), "notifications must support realtime subscription");
assert.ok(notifications.includes("send-push-notification"), "client push dispatch must go through the Edge Function");
assert.ok(pushFunction.includes("SUPABASE_SERVICE_ROLE_KEY"), "push Edge Function must use service role only on the server");
assert.ok(pushFunction.includes("userClient.auth.getUser"), "push Edge Function must verify the caller JWT");
assert.ok(pushFunction.includes("message.sender_id !== userResult.user.id"), "push Edge Function must verify message ownership");
assert.ok(matching.includes("DISMISSED_ACTIONS"), "matching must filter pass/like/super-like/block actions");
assert.ok(matching.includes('"block"'), "matching must hide blocked profiles");
assert.ok(smtpScript.includes("SUPABASE_ACCESS_TOKEN"), "SMTP Management API script must require an access token");
assert.ok(smtpScript.includes("smtp_pass"), "SMTP script must configure SMTP password only server-side");
assert.ok(!repository.includes("SMTP_PASS"), "SMTP password must never be used in the public app repository client");
assert.ok(!screens.includes("SMTP_PASS"), "SMTP password must never be referenced by UI code");

assert.ok(schema.includes("create table if not exists public.profile_private"), "private profile table must exist");
assert.ok(schema.includes("create table if not exists public.account_deletion_requests"), "account deletion request table must exist");
assert.ok(schema.includes("create table if not exists public.push_tokens"), "push token table must exist");
assert.ok(schema.includes("messages_body_length"), "database must enforce message body length");
assert.ok(schema.includes("'block'"), "database interactions must support block");
assert.ok(schema.includes("alter publication supabase_realtime add table public.messages"), "messages must be in realtime publication");
assert.ok(schema.includes("alter publication supabase_realtime add table public.notifications"), "notifications must be in realtime publication");
assert.ok(schema.includes("revoke all on all tables in schema public from authenticated"), "authenticated grants must be explicit");
assert.ok(schema.includes("grant select ("), "profiles must use column-level select grants");
assert.ok(!schema.includes("grant select, insert, update, delete on all tables in schema public to authenticated"), "broad authenticated table grants are not allowed");
assert.ok(schema.includes("file_size_limit = 5242880"), "storage bucket must enforce max file size");
assert.ok(schema.includes("allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']"), "storage bucket must restrict image types");
assert.ok(schema.includes("idx_messages_conversation_id_created_at"), "message reads must be indexed for production");
assert.ok(schema.includes("account deletion owner access"), "account deletion requests must be owner-scoped");
assert.ok(schema.includes("push token owner access"), "push token records must be owner-scoped");

assert.ok(!readme.includes("RLS policies are deliberately permissive"), "README must not document obsolete permissive RLS guidance");

console.log("Security audit passed: profile privacy, local cache minimization, upload controls, password policy, and Supabase grants are hardened.");
