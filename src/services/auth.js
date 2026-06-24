import { Platform } from "react-native";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

function ensureSupabase() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}

function appRedirectUrl(path = "auth") {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }

  return `nikkahnoor://${path}`;
}

export async function getCurrentSession() {
  ensureSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

export async function signUpWithEmail({ email, password, fullName }) {
  ensureSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: appRedirectUrl("auth"),
      data: { full_name: fullName.trim() },
    },
  });

  if (error) throw error;
  return data;
}

export async function resendSignupOtp(email) {
  ensureSupabase();
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: appRedirectUrl("auth") },
  });

  if (error) throw error;
  return data;
}

export async function verifyEmailOtp({ email, token }) {
  ensureSupabase();
  const payload = {
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: "email",
  };
  const { data, error } = await supabase.auth.verifyOtp(payload);

  if (!error) return data;

  const fallback = await supabase.auth.verifyOtp({ ...payload, type: "signup" });
  if (fallback.error) throw error;
  return fallback.data;
}

export async function signInWithEmail({ email, password }) {
  ensureSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email) {
  ensureSupabase();
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: appRedirectUrl("reset-password") },
  );

  if (error) throw error;
  return data;
}

export async function updatePassword(password) {
  ensureSupabase();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function updateEmailAddress(email) {
  ensureSupabase();
  const { data, error } = await supabase.auth.updateUser({
    email: email.trim().toLowerCase(),
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
