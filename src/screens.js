import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AppLogo,
  Avatar,
  Badge,
  BottomNav,
  Card,
  Chip,
  Field,
  Header,
  Icon,
  IconButton,
  Pill,
  PrimaryButton,
  ProgressBar,
  SelectField,
  StatusMessage,
  StatusText,
  SecondaryButton,
} from "./components";
import { premiumTiers } from "./data";
import { colors, radius, shadow, spacing, type } from "./theme";

const livingSituationOptions = [
  "Own house",
  "With family",
  "With parents",
  "Rented",
  "Living with first family",
  "Separate residence",
];

const photoPrivacyOptions = [
  "Blur before mutual match",
  "Show to verified profiles only",
  "Show after mutual match",
  "Family viewing only",
];

const sectOptions = ["Sunni", "Shia", "Other", "Prefer not to say"];

const prayerOptions = [
  "5 times daily",
  "Regular prayer",
  "Occasional",
  "Learning consistency",
  "Prefer not to say",
];

const quranOptions = [
  "Can recite with Tajweed",
  "Can recite Quran",
  "Learning",
  "Prefer not to say",
];

const familyTypeOptions = [
  "Joint family",
  "Nuclear family",
  "Family involved",
  "Open to discussion",
];

const locationPreferenceOptions = [
  "Same city",
  "Same province",
  "Anywhere in Pakistan",
  "Open to overseas Pakistanis",
];

const maritalPreferenceOptions = [
  "Widow",
  "Widower",
  "Divorced",
  "Currently married",
  "Either",
  "Any",
];

const matrimonialGoalOptions = [
  "Companionship with family involvement",
  "Widow/widower with children welcome",
  "Fresh start after divorce",
  "Open to second wife arrangement",
  "Overseas relocation possible",
  "Religious household and simple Nikah",
  "Career-supportive partnership",
  "Separate residence after Nikah",
];

function Screen({ children, bottomNav, padded = true }) {
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          padded && styles.scrollPadded,
          bottomNav && styles.withBottomNav,
        ]}
      >
        {children}
      </ScrollView>
      {bottomNav}
    </View>
  );
}

function personName(profile) {
  if (!profile) return "Profile";
  return [profile.name, profile.age].filter(Boolean).join(", ");
}

function findProfile(profiles, id) {
  return profiles.find((profile) => profile.id === id);
}

function getProfileMatches(matches, profiles) {
  return matches
    .map((match) => ({
      ...match,
      profile: findProfile(profiles, match.matchedUserId),
    }))
    .filter((match) => match.profile);
}

function createStatus(message, tone = "info") {
  return message ? { message, tone } : null;
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function validateFamilyMember(member) {
  if (!member.name?.trim() || !member.relation?.trim() || !member.phone?.trim() || !member.permission?.trim()) {
    return "Please add a name, relation, phone number, and permission.";
  }

  if (!/^\+?[\d\s()-]{8,}$/.test(member.phone.trim())) {
    return "Enter a valid phone number for the family member.";
  }

  return "";
}

export function WelcomeScreen({ navigate, syncLabel, syncTone, session, signOut }) {
  const signedIn = Boolean(session?.user);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80",
        }}
        resizeMode="cover"
        style={styles.welcomeHero}
      >
        <View style={styles.darkOverlay} />
        <View style={styles.languagePill}>
          <Text style={styles.languageText}>English / اردو</Text>
        </View>
        <View style={styles.welcomeCopy}>
          <View style={styles.logoRow}>
            <AppLogo size={48} />
            <Text style={styles.brandName}>Nikkah Noor</Text>
          </View>
          <Text style={type.h1}>Find Your Life Partner with Dignity</Text>
          <Text style={styles.bodySoft}>
            A trusted platform for second marriage in accordance with Islamic values.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.welcomeActions}>
        <PrimaryButton
          title={signedIn ? "Continue to App" : "Create Account"}
          onPress={() => navigate(signedIn ? "home" : "authSignup")}
        />
        <SecondaryButton
          title={signedIn ? "Sign Out" : "Sign In"}
          onPress={signedIn ? signOut : () => navigate("authLogin")}
        />
        <StatusMessage
          compact
          message={`${syncLabel}. Private profiles, encrypted verification, family-aware matching.`}
          tone={syncTone}
        />
      </View>
    </View>
  );
}

export function GenderScreen({ navigate, session, currentUser, updateCurrentUser }) {
  const choices = [
    ["male", "Male", "مرد", colors.teal],
    ["female", "Female", "خاتون", colors.purple],
  ];

  function setStatus(status) {
    updateCurrentUser({ maritalStatus: status });
  }

  return (
    <Screen>
      <Header
        eyebrow="Step 1 of 6"
        title="I am registering as"
        onBack={() => navigate(session?.user ? "home" : "welcome")}
      />
      <View style={styles.choiceGrid}>
        {choices.map(([key, label, urdu, tone]) => {
          const selected = currentUser.gender === key;
          return (
            <Pressable
              key={key}
              onPress={() => updateCurrentUser({ gender: key })}
              style={[
                styles.identityCard,
                { backgroundColor: tone },
                selected && styles.identitySelected,
              ]}
            >
              <View style={styles.silhouette}>
                <Icon name="user" color={colors.text} size={30} />
              </View>
              <Text style={styles.identityTitle}>{label}</Text>
              <Text style={styles.identityUrdu}>{urdu}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={styles.infoCard}>
        <Icon name="shield" color={colors.gold} />
        <Text style={styles.noteText}>
          This updates profile privacy, matching direction, and family/wali controls immediately.
        </Text>
      </Card>

      <Card>
        <Text style={type.h3}>Marital status</Text>
        {["Divorced", currentUser.gender === "female" ? "Widow" : "Widower"].map((status) => (
          <OptionRow
            key={status}
            title={status}
            detail="Purposeful matching with family sensitivity."
            selected={currentUser.maritalStatus === status}
            onPress={() => setStatus(status)}
          />
        ))}
        {currentUser.gender === "male" ? (
          <>
            <OptionRow
              title="Currently married"
              detail="Requires clear consent and financial responsibility."
              selected={currentUser.maritalStatus === "Currently married"}
              onPress={() => setStatus("Currently married")}
            />
            <CheckLine
              label="First wife is aware and consenting."
              checked={Boolean(currentUser.firstWifeConsent)}
              onPress={() => updateCurrentUser({ firstWifeConsent: !currentUser.firstWifeConsent })}
            />
            <Field
              label="Planned arrangement"
              value={currentUser.plannedArrangement || ""}
              onChangeText={(plannedArrangement) => updateCurrentUser({ plannedArrangement })}
              placeholder="Separate residence, financial support, family process..."
              multiline
            />
          </>
        ) : null}
      </Card>

      <PrimaryButton title="Continue" onPress={() => navigate("profile")} style={styles.stickyButton} />
    </Screen>
  );
}

function OptionRow({ title, detail, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.optionRow, selected && styles.optionSelected]}>
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <View style={styles.flex}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.bodySoft}>{detail}</Text>
      </View>
    </Pressable>
  );
}

function passwordPolicyIssue(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password needs at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password needs at least one lowercase letter.";
  if (!/\d/.test(password)) return "Password needs at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password needs at least one symbol.";
  return "";
}

export function EmailAuthScreen({
  mode = "login",
  navigate,
  session,
  signUpWithEmail,
  signInWithEmail,
  syncLabel,
  syncTone,
}) {
  const isSignup = mode === "signup";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || (isSignup && !fullName.trim())) {
      setStatus(createStatus("Please complete all required fields.", "error"));
      return;
    }
    const passwordIssue = isSignup ? passwordPolicyIssue(password) : "";
    if (passwordIssue) {
      setStatus(createStatus(passwordIssue, "error"));
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setStatus(createStatus("Passwords do not match.", "error"));
      return;
    }

    setSubmitting(true);
    setStatus(createStatus(isSignup ? "Creating account..." : "Signing in...", "info"));
    try {
      if (isSignup) {
        await signUpWithEmail({ email: normalizedEmail, password, fullName });
      } else {
        await signInWithEmail({ email: normalizedEmail, password });
      }
    } catch (error) {
      setStatus(createStatus(error.message || "Authentication failed.", "error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header
        eyebrow={isSignup ? "Email signup" : "Welcome back"}
        title={isSignup ? "Create your account" : "Sign in securely"}
        onBack={() => navigate(session?.user ? "home" : "welcome")}
      />
      <Card style={styles.centeredCard}>
        <View style={styles.authIcon}>
          <Icon name="lock" color={colors.text} size={30} />
        </View>
        {isSignup ? (
          <Field
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            autoCapitalize="words"
            textContentType="name"
          />
        ) : null}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder={isSignup ? "8+ chars, number and symbol" : "Your password"}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isSignup ? "new-password" : "password"}
          textContentType={isSignup ? "newPassword" : "password"}
        />
        {isSignup ? (
          <Field
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
        ) : null}
        <View style={styles.inlineNote}>
          <Icon name="shield" color={colors.gold} size={15} />
          <Text style={styles.noteText}>
            {isSignup
              ? "We will email a 6-digit verification code before your profile opens."
              : "Email and password are handled by Supabase Auth."}
          </Text>
        </View>
      </Card>

      <StatusMessage message={status?.message} tone={status?.tone} />
      <PrimaryButton
        title={submitting ? "Please wait..." : isSignup ? "Send Email Code" : "Sign In"}
        onPress={submit}
        disabled={submitting}
        style={styles.stickyButton}
      />
      <View style={styles.authLinks}>
        <Pressable onPress={() => navigate(isSignup ? "authLogin" : "authSignup")}>
          <Text style={styles.goldLink}>
            {isSignup ? "Already have an account? Sign in" : "New here? Create account"}
          </Text>
        </Pressable>
        {!isSignup ? (
          <Pressable onPress={() => navigate("forgotPassword")}>
            <Text style={styles.goldLink}>Forgot password?</Text>
          </Pressable>
        ) : null}
      </View>
      <Card style={styles.infoCard}>
        <View style={styles.flex}>
          <Text style={styles.optionTitle}>Email verification</Text>
          <StatusMessage
            compact
            message={`${syncLabel}. Email verification protects profile access.`}
            tone={syncTone}
          />
        </View>
      </Card>
    </Screen>
  );
}

export function EmailOtpScreen({
  navigate,
  session,
  pendingEmail,
  verifyEmailOtp,
  resendSignupOtp,
}) {
  const [email, setEmail] = useState(pendingEmail || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function setDigit(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
  }

  async function submit() {
    const token = otp.join("");
    if (!email.trim() || token.length !== 6) {
      setStatus(createStatus("Enter your email and the 6-digit code.", "error"));
      return;
    }
    setSubmitting(true);
    setStatus(createStatus("Verifying email...", "info"));
    try {
      await verifyEmailOtp({ email, token });
    } catch (error) {
      setStatus(createStatus(error.message || "Could not verify this code.", "error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email.trim()) {
      setStatus(createStatus("Enter your signup email first.", "error"));
      return;
    }
    setSubmitting(true);
    try {
      await resendSignupOtp(email);
      setStatus(createStatus("A fresh code was sent. Check your inbox.", "success"));
    } catch (error) {
      setStatus(createStatus(error.message || "Could not resend code yet.", "error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header
        eyebrow="Email verification"
        title="Enter the code"
        onBack={() => navigate(session?.user ? "home" : "authSignup")}
      />
      <Text style={styles.bodySoft}>
        Supabase sends the verification code to your email. Enter it here to unlock profile creation.
      </Text>
      <Card>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(value) => setDigit(index, value)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.otpBox}
            />
          ))}
        </View>
      </Card>
      <StatusMessage message={status?.message} tone={status?.tone} />
      <PrimaryButton title={submitting ? "Please wait..." : "Verify Email"} onPress={submit} disabled={submitting} />
      <SecondaryButton title="Resend Code" onPress={resend} disabled={submitting} />
    </Screen>
  );
}

export function ForgotPasswordScreen({ navigate, session, sendPasswordReset }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!email.trim()) {
      setStatus(createStatus("Enter your account email.", "error"));
      return;
    }
    setSubmitting(true);
    setStatus(createStatus("Sending reset email...", "info"));
    try {
      await sendPasswordReset(email);
      setStatus(createStatus("Password reset link sent. Open your email and return here to set a new password.", "success"));
    } catch (error) {
      setStatus(createStatus(error.message || "Could not send reset email.", "error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header
        eyebrow="Account recovery"
        title="Reset password"
        onBack={() => navigate(session?.user ? "home" : "authLogin")}
      />
      <Card style={styles.centeredCard}>
        <View style={styles.authIcon}>
          <Icon name="lock" color={colors.text} size={30} />
        </View>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Text style={styles.bodySoft}>
          We will send a secure Supabase recovery link. After the link opens the app, set a new password.
        </Text>
      </Card>
      <StatusMessage message={status?.message} tone={status?.tone} />
      <PrimaryButton title={submitting ? "Sending..." : "Send Reset Email"} onPress={submit} disabled={submitting} />
    </Screen>
  );
}

export function ResetPasswordScreen({ navigate, session, updatePassword }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const passwordIssue = passwordPolicyIssue(password);
    if (passwordIssue) {
      setStatus(createStatus(passwordIssue, "error"));
      return;
    }
    if (password !== confirmPassword) {
      setStatus(createStatus("Passwords do not match.", "error"));
      return;
    }
    setSubmitting(true);
    setStatus(createStatus("Updating password...", "info"));
    try {
      await updatePassword(password);
    } catch (error) {
      setStatus(createStatus(error.message || "Could not update password.", "error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header
        eyebrow="Secure reset"
        title="Choose new password"
        onBack={() => navigate(session?.user ? "home" : "authLogin")}
      />
      <Card style={styles.centeredCard}>
        <Field
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Field
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </Card>
      <StatusMessage message={status?.message} tone={status?.tone} />
      <PrimaryButton title={submitting ? "Updating..." : "Update Password"} onPress={submit} disabled={submitting} />
    </Screen>
  );
}

export function ProfileScreen({ navigate, currentUser, updateCurrentUser, syncLabel, syncTone, uploadProfilePhoto }) {
  const tagOptions = ["Traditional", "Educated", "Social work", "Responsible", "Family-first", "Religious"];
  const [photoStatus, setPhotoStatus] = useState(null);

  function toggleTag(tag) {
    const tags = currentUser.tags || [];
    updateCurrentUser({
      tags: tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
    });
  }

  function patchPreferences(patch) {
    updateCurrentUser({ preferences: patch });
  }

  async function pickProfilePhoto() {
    setPhotoStatus(createStatus("Opening gallery...", "info"));
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult && !permissionResult.granted) {
        setPhotoStatus(createStatus("Photo library permission is required.", "error"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const asset = result.assets[0];
        if (asset.mimeType && !["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType)) {
          setPhotoStatus(createStatus("Only JPG, PNG, or WEBP profile images are allowed.", "error"));
          return;
        }
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          setPhotoStatus(createStatus("Profile image must be 5MB or smaller.", "error"));
          return;
        }
        updateCurrentUser({ photo: asset.uri });
        const storedPhoto = await uploadProfilePhoto(asset);
        updateCurrentUser({ photo: storedPhoto });
        setPhotoStatus(createStatus("Profile image updated.", "success"));
      } else {
        setPhotoStatus(null);
      }
    } catch (error) {
      setPhotoStatus(createStatus(error.message || "Could not open image picker.", "error"));
    }
  }

  const completion = Number(currentUser.stats?.completion || 75);

  return (
    <Screen>
      <Header
        eyebrow="Step 2 of 6"
        title="Create your profile"
        onBack={() => navigate("gender")}
        right={<StatusText message={syncLabel} tone={syncTone} style={styles.savedText} numberOfLines={2} />}
      />
      <ProgressBar value={completion} />

      <Card style={styles.uploadCard}>
        <Avatar uri={currentUser.photo} size={128} />
        <SecondaryButton title="Upload Profile Image" onPress={pickProfilePhoto} />
        <StatusMessage compact message={photoStatus?.message} tone={photoStatus?.tone} />
        <SelectField
          label="Photo privacy"
          value={currentUser.photoPrivacy || ""}
          options={photoPrivacyOptions}
          onChange={(photoPrivacy) => updateCurrentUser({ photoPrivacy })}
        />
      </Card>

      <Card>
        <SectionHeader title="Personal details" meta="Realtime" />
        <View style={styles.formGrid}>
          <Field label="Full name" value={currentUser.name || ""} onChangeText={(name) => updateCurrentUser({ name })} />
          <Field label="Age" value={String(currentUser.age || "")} onChangeText={(age) => updateCurrentUser({ age })} />
          <Field label="City" value={currentUser.city || ""} onChangeText={(city) => updateCurrentUser({ city })} />
          <SelectField
            label="Living situation"
            value={currentUser.livingSituation || ""}
            options={livingSituationOptions}
            onChange={(livingSituation) => updateCurrentUser({ livingSituation })}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Religious information" meta="Editable" />
        <View style={styles.formGrid}>
          <SelectField
            label="Sect"
            value={currentUser.sect || ""}
            options={sectOptions}
            onChange={(sect) => updateCurrentUser({ sect })}
          />
          <SelectField
            label="Prayer regularity"
            value={currentUser.prayer || ""}
            options={prayerOptions}
            onChange={(prayer) => updateCurrentUser({ prayer })}
          />
          <SelectField
            label="Quran recitation"
            value={currentUser.quran || ""}
            options={quranOptions}
            onChange={(quran) => updateCurrentUser({ quran })}
          />
          <SelectField
            label="Family type"
            value={currentUser.familyType || ""}
            options={familyTypeOptions}
            onChange={(familyType) => updateCurrentUser({ familyType })}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Family and profession" meta="Editable" />
        <Field label="Children" value={currentUser.children || ""} onChangeText={(children) => updateCurrentUser({ children })} />
        <Field label="Education" value={currentUser.education || ""} onChangeText={(education) => updateCurrentUser({ education })} />
        <Field label="Profession" value={currentUser.profession || ""} onChangeText={(profession) => updateCurrentUser({ profession })} />
        <Field label="Income range" value={currentUser.incomeRange || ""} onChangeText={(incomeRange) => updateCurrentUser({ incomeRange })} />
      </Card>

      <Card>
        <SectionHeader title="Preferences" meta="Dynamic" />
        <View style={styles.twoCol}>
          <Field
            label="Age min"
            value={currentUser.preferences?.ageMin || ""}
            onChangeText={(ageMin) => patchPreferences({ ageMin })}
          />
          <Field
            label="Age max"
            value={currentUser.preferences?.ageMax || ""}
            onChangeText={(ageMax) => patchPreferences({ ageMax })}
          />
        </View>
        <SelectField
          label="Location preference"
          value={currentUser.preferences?.location || ""}
          options={locationPreferenceOptions}
          onChange={(location) => patchPreferences({ location })}
        />
        <SelectField
          label="Marital status preference"
          value={currentUser.preferences?.maritalStatus || ""}
          options={maritalPreferenceOptions}
          onChange={(maritalStatus) => patchPreferences({ maritalStatus })}
        />
        <SelectField
          label="Matrimonial goal"
          value={currentUser.preferences?.matrimonialGoal || ""}
          options={matrimonialGoalOptions}
          onChange={(matrimonialGoal) => patchPreferences({ matrimonialGoal })}
        />
      </Card>

      <Card>
        <SectionHeader title="About me" meta={`${currentUser.bio?.length || 0} / 500`} />
        <Field
          label="Bio"
          multiline
          value={currentUser.bio || ""}
          onChangeText={(bio) => updateCurrentUser({ bio })}
        />
        <View style={styles.chipWrap}>
          {tagOptions.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={(currentUser.tags || []).includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </Card>

      <PrimaryButton title="Start Matching" onPress={() => navigate("home")} style={styles.stickyButton} />
    </Screen>
  );
}

function SectionHeader({ title, meta }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={type.h3}>{title}</Text>
      <Pill label={meta} tone="gold" />
    </View>
  );
}

function CheckLine({ label, checked, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.checkRow}>
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked ? <Icon name="shield" color={colors.bg} size={12} /> : null}
      </View>
      <Text style={styles.bodySoft}>{label}</Text>
    </Pressable>
  );
}

function SummaryList({ items }) {
  return (
    <View style={styles.summaryList}>
      {items.filter(Boolean).map((item, index) => (
        <View key={`${item}-${index}`} style={styles.summaryItem}>
          <Text style={styles.noteText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function HomeScreen({ active, navigate, openFilters, openDetails, profile, onSwipe, syncLabel, syncTone }) {
  return (
    <Screen
      padded={false}
      bottomNav={<BottomNav active={active} navigate={navigate} openFilters={openFilters} />}
    >
      <View style={styles.homeContent}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <AppLogo size={30} />
            <Text style={styles.brandSmall}>Nikkah Noor</Text>
          </View>
          <View style={styles.row}>
            <IconButton name="filter" label="Open filters" onPress={openFilters} />
            <IconButton name="bell" label="Notifications" onPress={() => navigate("notifications")} />
          </View>
        </View>

        <Card style={styles.prayerWidget}>
          <Icon name="moon" color={colors.gold} />
          <View style={styles.flex}>
            <Text style={styles.optionTitle}>Asr in 42 min</Text>
            <StatusText
              message={`${syncLabel}. Quiet mode can pause prompts during prayer.`}
              tone={syncTone}
            />
          </View>
          <Pill label="Qibla" tone="gold" />
        </Card>

        {profile ? <DiscoveryCard profile={profile} openDetails={openDetails} /> : <EmptyCard />}

        <View style={styles.swipeActions}>
          <RoundAction icon="pass" tone="pass" onPress={() => onSwipe("pass")} />
          <RoundAction icon="info" tone="info" onPress={openDetails} />
          <RoundAction icon="heart" tone="like" onPress={() => onSwipe("like")} />
          <RoundAction icon="star" tone="super" onPress={() => onSwipe("super")} />
          <RoundAction icon="lock" tone="block" onPress={() => onSwipe("block")} />
        </View>
      </View>
    </Screen>
  );
}

function EmptyCard() {
  return (
    <Card style={styles.emptyCard}>
      <Text style={type.h2}>No profiles found</Text>
      <Text style={styles.bodySoft}>Adjust filters or seed more users in Supabase.</Text>
    </Card>
  );
}

function DiscoveryCard({ profile, openDetails }) {
  return (
    <ImageBackground source={{ uri: profile.photo }} resizeMode="cover" style={styles.profileCard}>
      <View style={styles.profileShade} />
      <View style={styles.badgeStack}>
        <Badge icon="shield" tone="success" />
        <Badge icon="star" tone="gold" />
        <Badge icon="users" tone="info" />
      </View>
      <View style={styles.photoPrivacy}>
        <Icon name="lock" color={colors.text} size={15} />
        <Text style={styles.privacyText}>{profile.photoPrivacy || "Private photo controls"}</Text>
      </View>
      <View style={styles.profileOverlay}>
        <View style={styles.sectionHeader}>
          <Text style={type.h1}>{personName(profile)}</Text>
          <Pill label={`${profile.matchScore || profile.compatibility || 80}%`} tone="success" />
        </View>
        <View style={styles.row}>
          <Icon name="pin" color={colors.textSoft} size={15} />
          <Text style={styles.bodySoft}>{profile.city}, {profile.country}</Text>
        </View>
        <View style={styles.chipWrap}>
          {profile.preferences?.matrimonialGoal ? <Pill label={profile.preferences.matrimonialGoal} tone="gold" /> : null}
          {(profile.tags || []).slice(0, 4).map((tag) => (
            <Pill key={tag} label={tag} />
          ))}
        </View>
        <Pressable onPress={openDetails} style={styles.detailsButton}>
          <Text style={styles.detailsText}>View details</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

function RoundAction({ icon, tone, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundAction,
        tone === "like" && styles.roundLike,
        tone === "super" && styles.roundSuper,
        tone === "pass" && styles.roundPass,
        tone === "info" && styles.roundInfo,
        tone === "block" && styles.roundBlock,
        pressed && styles.pressed,
      ]}
    >
      <Icon
        name={icon}
        color={tone === "pass" || tone === "block" ? "#FF7B91" : tone === "like" ? colors.text : colors.gold}
        size={tone === "like" ? 28 : 23}
      />
    </Pressable>
  );
}

export function MatchesScreen({ active, navigate, openFilters, openChat, matches, profiles }) {
  const rows = getProfileMatches(matches, profiles);
  return (
    <Screen bottomNav={<BottomNav active={active} navigate={navigate} openFilters={openFilters} />}>
      <Header
        eyebrow={`${rows.length} total`}
        title="Your Matches"
        right={<IconButton name="home" label="Home" onPress={() => navigate("home")} />}
      />
      <View style={styles.segmented}>
        {["All Matches", "New", "Messages"].map((item, index) => (
          <View key={item} style={[styles.segment, index === 0 && styles.segmentActive]}>
            <Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={styles.listGap}>
        {rows.length === 0 ? (
          <Card>
            <Text style={type.h3}>No matches yet</Text>
            <Text style={styles.bodySoft}>Like a profile from Home to start a respectful conversation.</Text>
            <SecondaryButton title="Explore Profiles" onPress={() => navigate("home")} />
          </Card>
        ) : null}
        {rows.map((match) => (
          <Pressable
            key={match.id}
            onPress={() => openChat(match.id)}
            style={[styles.matchRow, match.unread > 0 && styles.matchRowNew]}
          >
            <Avatar uri={match.profile.photo} />
            <View style={styles.flex}>
              <Text style={styles.optionTitle}>{personName(match.profile)}</Text>
              <Text style={styles.bodySoft}>{match.profile.city} · {match.profile.maritalStatus}</Text>
              <Text numberOfLines={1} style={styles.previewText}>{match.profile.bio}</Text>
            </View>
            {match.unread ? <View style={styles.unreadBadge}><Text style={styles.unreadText}>{match.unread}</Text></View> : null}
          </Pressable>
        ))}
      </View>
      <Card>
        <Text style={type.h3}>Peak time starts at 8 PM</Text>
        <Text style={styles.bodySoft}>Use boosts or update profile fields to test dynamic stats.</Text>
        <SecondaryButton title="View Boosts" onPress={() => navigate("premium")} />
      </Card>
    </Screen>
  );
}

export function ChatScreen({ navigate, messages, matches, profiles, currentUserId, selectedMatchId, sendMessage, syncLabel, syncTone, blockProfile }) {
  const [draft, setDraft] = useState("");
  const activeMatch = matches.find((match) => match.id === selectedMatchId) || matches[0];
  const partner = activeMatch ? findProfile(profiles, activeMatch.matchedUserId) : null;
  const conversationMessages = activeMatch
    ? messages.filter((message) => message.conversationId === activeMatch.id)
    : [];
  const icebreakers = [
    "As-salamu Alaykum",
    "I noticed we share similar values.",
    "May I learn more about your family preferences?",
  ];

  function submit() {
    const sent = sendMessage(draft, activeMatch?.id);
    if (sent) setDraft("");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.chatHeader}>
        <IconButton name="back" label="Back" onPress={() => navigate("matches")} />
        {partner ? <Avatar uri={partner.photo} /> : null}
        <View style={styles.flex}>
          <Text style={styles.optionTitle}>{partner?.name || "Conversation"}</Text>
          <Text style={styles.bodySoft}>Active 12 min ago</Text>
          <StatusText message={syncLabel || currentUserId} tone={syncTone} />
        </View>
        <IconButton name="lock" label="Block user" onPress={() => partner && blockProfile(partner)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatScroll}>
        <Card style={styles.safetyBanner}>
          <Icon name="shield" color={colors.warning} />
          <Text style={styles.safetyText}>Never send money or sensitive documents in chat.</Text>
        </Card>
        {!activeMatch ? (
          <Card>
            <Text style={type.h3}>No active conversation yet</Text>
            <Text style={styles.bodySoft}>Open a match first, then send a message from here.</Text>
            <SecondaryButton title="Go to Matches" onPress={() => navigate("matches")} />
          </Card>
        ) : null}
        {conversationMessages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.from === "me" ? styles.messageSent : styles.messageReceived,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>{message.time}</Text>
          </View>
        ))}
        <View style={styles.chipWrap}>
          {icebreakers.map((icebreaker) => (
            <Chip key={icebreaker} label={icebreaker} selected={false} onPress={() => setDraft(icebreaker)} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.composer}>
        <IconButton name="camera" label="Attach photo" disabled={!activeMatch} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a respectful message..."
          placeholderTextColor={colors.textFaint}
          editable={Boolean(activeMatch)}
          style={styles.composerInput}
        />
        <IconButton
          name="send"
          label="Send"
          onPress={submit}
          disabled={!activeMatch || !draft.trim()}
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

export function SettingsScreen({
  active,
  navigate,
  openFilters,
  currentUser,
  subscription,
  updateSubscription,
  syncLabel,
  syncTone,
  resetDemo,
  signOut,
  updateEmailAddress,
}) {
  const [emailDraft, setEmailDraft] = useState(currentUser.email || "");
  const [emailStatus, setEmailStatus] = useState(null);

  async function submitEmailUpdate() {
    if (!isValidEmail(emailDraft)) {
      setEmailStatus(createStatus("Enter a valid email address.", "error"));
      return;
    }
    try {
      await updateEmailAddress(emailDraft);
      setEmailStatus(createStatus("Confirmation email sent. Your login email changes after verification.", "success"));
    } catch (error) {
      setEmailStatus(createStatus(error.message || "Could not update email.", "error"));
    }
  }

  return (
    <Screen bottomNav={<BottomNav active={active} navigate={navigate} openFilters={openFilters} />}>
      <Header title="Settings" right={<IconButton name="more" label="More" />} />
      <Card style={styles.profileSummary}>
        <Avatar uri={currentUser.photo} size={98} />
        <Text style={type.h2}>{currentUser.name}</Text>
        <Text style={styles.bodySoft}>{currentUser.handle}</Text>
        {currentUser.email ? <Text style={styles.bodySoft}>{currentUser.email}</Text> : null}
        <ProgressBar value={Number(currentUser.stats?.completion || 75)} />
        <StatusText message={syncLabel} tone={syncTone} style={styles.goldLink} />
        <PrimaryButton title="Edit Profile" onPress={() => navigate("profile")} />
      </Card>

      <View style={styles.statsGrid}>
        <StatTile icon="star" label={`${subscription.superLikes} Super Likes`} sublabel="Get More" tone="gold" />
        <StatTile icon="bolt" label={`${subscription.boosts} Boosts`} sublabel="Available" tone="purple" />
        <StatTile icon="eye" label={`${currentUser.stats?.views || 0} Views`} sublabel="This week" tone="teal" />
        <StatTile icon="lock" label="Privacy" sublabel={currentUser.photoPrivacy} tone="navy" />
      </View>

      <Card>
        <Text style={type.h3}>Account email</Text>
        <Field
          label="Email"
          value={emailDraft}
          onChangeText={setEmailDraft}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <StatusMessage message={emailStatus?.message} tone={emailStatus?.tone} />
        <SecondaryButton title="Send Email Update Confirmation" onPress={submitEmailUpdate} />
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={type.h3}>Nikkah Noor {subscription.tier}</Text>
          <Pill label={subscription.status} tone="gold" />
        </View>
        <CheckLine
          label="Go Incognito"
          checked={Boolean(subscription.incognito)}
          onPress={() => updateSubscription({ incognito: !subscription.incognito })}
        />
        <PrimaryButton title="Upgrade" onPress={() => navigate("premium")} />
      </Card>

      <View style={styles.listGap}>
        {[
          ["Account settings", "user", "profile"],
          ["Notifications", "bell", "notifications"],
          ["Privacy center", "lock", "privacy"],
          ["Safety center", "shield", "safety"],
          ["Family access", "users", "family"],
          ["Terms and guidelines", "info", "legal"],
        ].map(([label, icon, target]) => (
          <Pressable key={label} onPress={() => navigate(target)} style={styles.settingsRow}>
            <Icon name={icon} color={colors.gold} />
            <Text style={styles.optionTitle}>{label}</Text>
            <Icon name="send" color={colors.textSoft} />
          </Pressable>
        ))}
      </View>
      <SecondaryButton title="Reset local 10-user demo data" onPress={resetDemo} />
      <SecondaryButton title="Sign Out" onPress={signOut} />
    </Screen>
  );
}

function StatTile({ icon, label, sublabel, tone }) {
  const backgroundColor =
    tone === "gold"
      ? "rgba(212,175,55,0.18)"
      : tone === "purple"
        ? "rgba(107,45,92,0.36)"
        : tone === "teal"
          ? "rgba(27,77,95,0.38)"
          : "rgba(44,62,80,0.42)";
  return (
    <Card style={[styles.statTile, { backgroundColor }]}>
      <Icon name={icon} color={colors.gold} />
      <Text style={styles.optionTitle}>{label}</Text>
      <Text style={styles.bodySoft}>{sublabel}</Text>
    </Card>
  );
}

export function PremiumScreen({ navigate, subscription, updateSubscription }) {
  const [checkoutStatus, setCheckoutStatus] = useState(null);

  function requestUpgrade(tierName) {
    updateSubscription({ requestedTier: tierName, checkoutStatus: "pending_payment_provider" });
    setCheckoutStatus(
      createStatus(
        "Secure checkout is not enabled yet. Your interest was saved without changing your plan.",
        "warning",
      ),
    );
  }

  return (
    <Screen>
      <Header eyebrow="Premium" title="Upgrade Your Experience" onBack={() => navigate("settings")} />
      <StatusMessage message={checkoutStatus?.message} tone={checkoutStatus?.tone} />
      {premiumTiers.map((tier) => (
        <Card key={tier.id} style={[styles.tierCard, tier.id === "gold" && styles.goldTier, tier.id === "platinum" && styles.platinumTier]}>
          <View style={styles.sectionHeader}>
            <Text style={type.h3}>{tier.name}</Text>
            <Pill label={subscription.tier === tier.name ? "Selected" : tier.label} tone={tier.id === "basic" ? "default" : "gold"} />
          </View>
          <Text style={styles.priceText}>{tier.price}</Text>
          <SummaryList items={tier.features} />
          <PrimaryButton
            title={subscription.tier === tier.name ? "Current Plan" : `Request ${tier.name}`}
            disabled={subscription.tier === tier.name}
            onPress={() => requestUpgrade(tier.name)}
          />
        </Card>
      ))}
      <Card>
        <Text style={type.h3}>Payment methods prepared</Text>
        <Text style={styles.bodySoft}>
          Checkout is disabled until a verified payment provider is connected for public launch.
        </Text>
        <View style={styles.methodGrid}>
          {["Visa", "Mastercard", "JazzCash", "Easypaisa"].map((method) => (
            <View key={method} style={styles.method}>
              <Text style={styles.optionTitle}>{method}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

export function PrivacyCenterScreen({ navigate, currentUser, requestAccountDeletion, syncLabel }) {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(null);

  function submitDeletionRequest() {
    requestAccountDeletion(reason || "User requested account deletion from Privacy Center.");
    setStatus(createStatus("Request submitted. Support will verify identity and complete deletion.", "success"));
  }

  return (
    <Screen>
      <Header eyebrow="Privacy" title="Privacy Center" onBack={() => navigate("settings")} />
      <Card>
        <Text style={type.h3}>Your private data</Text>
        <SummaryList
          items={[
            `Email: ${currentUser.email || "Not added"}`,
            `Photo privacy: ${currentUser.photoPrivacy || "Default"}`,
            "Phone, email, consent, and arrangement notes are stored in an owner-only private table.",
            syncLabel,
          ]}
        />
      </Card>
      <Card>
        <Text style={type.h3}>Account deletion</Text>
        <Text style={styles.bodySoft}>
          Submit a deletion request from here. Production support must verify identity before permanently deleting auth and profile records.
        </Text>
        <Field
          label="Reason (optional)"
          value={reason}
          onChangeText={setReason}
          placeholder="Tell us why you want deletion"
          multiline
        />
        <StatusMessage message={status?.message} tone={status?.tone} />
        <PrimaryButton title="Request Account Deletion" onPress={submitDeletionRequest} />
      </Card>
    </Screen>
  );
}

export function LegalScreen({ navigate }) {
  return (
    <Screen>
      <Header eyebrow="Legal" title="Terms and Guidelines" onBack={() => navigate("settings")} />
      <Card>
        <Text style={type.h3}>Privacy policy summary</Text>
        <SummaryList
          items={[
            "Use the service for serious matrimonial intent only.",
            "Do not share financial information or transfer money to users.",
            "Profile discovery shows limited public profile fields to authenticated users.",
            "Sensitive profile details are restricted to the account owner.",
          ]}
        />
      </Card>
      <Card>
        <Text style={type.h3}>Community guidelines</Text>
        <SummaryList
          items={[
            "Be truthful about marital status, family involvement, and intentions.",
            "No harassment, explicit content, scams, or impersonation.",
            "Reports are confidential and reviewed for user safety.",
            "Family and wali involvement features should be used respectfully.",
          ]}
        />
      </Card>
      <Card>
        <Text style={type.h3}>Launch requirement</Text>
        <Text style={styles.bodySoft}>
          Replace this in-app summary with lawyer-reviewed public Terms, Privacy Policy, and Community Guidelines URLs before app store submission.
        </Text>
      </Card>
    </Screen>
  );
}

export function SafetyScreen({ navigate, submitReport, profile, reports }) {
  const [reason, setReason] = useState("Scam/Fraud");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(null);

  function submitSafetyReport() {
    if (!profile) {
      setStatus(createStatus("Open a profile from discovery before submitting a report.", "warning"));
      return;
    }

    if (!reason.trim()) {
      setStatus(createStatus("Choose a report reason first.", "error"));
      return;
    }

    submitReport(reason.trim(), notes.trim());
    setNotes("");
    setStatus(createStatus(`Report submitted for ${profile.name}. Our safety team will review it confidentially.`, "success"));
  }

  return (
    <Screen>
      <Header eyebrow="Trust and safety" title="Your Safety Matters" onBack={() => navigate("settings")} />
      <Card style={styles.safetyHero}>
        <Icon name="shield" color={colors.success} size={34} />
        <Text style={type.h3}>Purposeful connections only</Text>
        <Text style={styles.bodySoft}>Reports are confidential and saved dynamically.</Text>
      </Card>
      {!profile ? (
        <Card>
          <Text style={type.h3}>No profile selected</Text>
          <Text style={styles.bodySoft}>Open a profile from Home before reporting someone from this screen.</Text>
          <SecondaryButton title="Go to Discovery" onPress={() => navigate("home")} />
        </Card>
      ) : null}
      <Field label="Report reason" value={reason} onChangeText={setReason} />
      <Field label={`Notes about ${profile?.name || "profile"}`} value={notes} onChangeText={setNotes} multiline />
      <StatusMessage message={status?.message} tone={status?.tone} />
      <PrimaryButton title="Submit Report" onPress={submitSafetyReport} />
      <Card>
        <Text style={type.h3}>Reports submitted: {reports.length}</Text>
        <SummaryList items={reports.slice(0, 3).map((report) => `${report.reason} · ${report.notes || "No notes"}`)} />
      </Card>
    </Screen>
  );
}

export function FamilyScreen({ navigate, familyMembers, upsertFamilyMember, currentUserId }) {
  const first = familyMembers[0] || { name: "", relation: "", phone: "", permission: "" };
  const [member, setMember] = useState(first);
  const [status, setStatus] = useState(null);

  function setField(key, value) {
    setMember((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const issue = validateFamilyMember(member);
    if (issue) {
      setStatus(createStatus(issue, "error"));
      return;
    }

    const cleanedMember = {
      ...member,
      userId: currentUserId,
      name: member.name.trim(),
      relation: member.relation.trim(),
      phone: member.phone.trim(),
      permission: member.permission.trim(),
    };

    upsertFamilyMember(cleanedMember);
    setStatus(createStatus("Family invitation saved. You can now involve them in match reviews.", "success"));
  }

  return (
    <Screen>
      <Header eyebrow="Family access" title="Involve Your Family" onBack={() => navigate("settings")} />
      <Card style={styles.profileSummary}>
        <View style={styles.familyIcon}>
          <Icon name="users" color={colors.text} size={34} />
        </View>
        <Text style={type.h3}>Add a trusted guardian or relative</Text>
        <Text style={[styles.bodySoft, styles.centerText]}>Invite family members to review matches, suggest profiles, or approve conversations.</Text>
      </Card>
      <Card>
        <Field label="Name" value={member.name} onChangeText={(value) => setField("name", value)} />
        <Field label="Relation" value={member.relation} onChangeText={(value) => setField("relation", value)} />
        <Field label="Phone" value={member.phone} onChangeText={(value) => setField("phone", value)} />
        <Field label="Permission" value={member.permission} onChangeText={(value) => setField("permission", value)} />
      </Card>
      <StatusMessage message={status?.message} tone={status?.tone} />
      <Card>
        <Text style={type.h3}>Saved family members</Text>
        <SummaryList items={familyMembers.map((item) => `${item.name} · ${item.relation} · ${item.permission}`)} />
      </Card>
      <PrimaryButton title="Save Invitation" onPress={save} style={styles.stickyButton} />
    </Screen>
  );
}

export function NotificationsScreen({
  navigate,
  notifications,
  notificationStatus,
  notificationStatusTone,
  registerPushNotifications,
}) {
  return (
    <Screen>
      <Header title="Notifications" onBack={() => navigate("home")} />
      <Card style={styles.infoCard}>
        <Icon name="bell" color={colors.gold} />
        <View style={styles.flex}>
          <Text style={styles.optionTitle}>Push notifications</Text>
          <StatusMessage compact message={notificationStatus} tone={notificationStatusTone} />
        </View>
        <SecondaryButton title="Enable" onPress={registerPushNotifications} />
      </Card>
      <View style={styles.segmented}>
        {["All", "Matches", "Activity"].map((item, index) => (
          <View key={item} style={[styles.segment, index === 0 && styles.segmentActive]}>
            <Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={styles.listGap}>
        {notifications.length === 0 ? (
          <Card>
            <Text style={type.h3}>No notifications yet</Text>
            <Text style={styles.bodySoft}>Matches, messages, profile activity, and system notices will appear here.</Text>
          </Card>
        ) : null}
        {notifications.map((notification) => (
          <Card key={notification.id} style={styles.notificationRow}>
            <Icon name={notification.type === "match" ? "heart" : notification.type === "activity" ? "eye" : "shield"} color={colors.gold} />
            <Text style={[styles.optionTitle, styles.flex]}>{notification.title}</Text>
            <Text style={styles.bodySoft}>{notification.time}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

export function FiltersModal({ visible, filters, updateFilters, onClose }) {
  const chipOptions = [
    ["Same city", "location", "Same city"],
    ["Verified only", "verifiedOnly", true],
    ["Open to children", "openToChildren", true],
    ["Recently active", "recentlyActive", true],
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sectionHeader}>
            <Text style={type.h2}>Advanced Filters</Text>
            <IconButton name="close" label="Close filters" onPress={onClose} />
          </View>
          <View style={styles.twoCol}>
            <Field label="Age min" value={filters.ageMin || ""} onChangeText={(ageMin) => updateFilters({ ageMin })} />
            <Field label="Age max" value={filters.ageMax || ""} onChangeText={(ageMax) => updateFilters({ ageMax })} />
          </View>
          <View style={styles.chipWrap}>
            {chipOptions.map(([label, key, value]) => {
              const selected = filters[key] === value;
              return (
                <Chip
                  key={label}
                  label={label}
                  selected={selected}
                  onPress={() => updateFilters({ [key]: selected ? false : value })}
                />
              );
            })}
          </View>
          <Card>
            <Text style={type.h3}>Religious compatibility</Text>
            <CheckLine label="Prayer is important" checked={filters.prayerImportant} onPress={() => updateFilters({ prayerImportant: !filters.prayerImportant })} />
            <CheckLine label="Family involvement expected" checked={filters.familyInvolvement} onPress={() => updateFilters({ familyInvolvement: !filters.familyInvolvement })} />
          </Card>
          <PrimaryButton title="Apply Filters · 10 test users" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export function DetailsModal({ visible, onClose, profile, onLike, onBlock }) {
  if (!profile) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sectionHeader}>
            <Text style={type.h2}>Profile Details</Text>
            <IconButton name="close" label="Close details" onPress={onClose} />
          </View>
          <View style={styles.detailHeader}>
            <Avatar uri={profile.photo} size={96} />
            <View style={styles.flex}>
              <Text style={type.h3}>{personName(profile)}</Text>
              <Text style={styles.bodySoft}>{profile.city} · {profile.maritalStatus} · {profile.profession}</Text>
            </View>
          </View>
          <Text style={styles.detailCopy}>{profile.bio}</Text>
          <SummaryList
            items={[
              profile.education,
              profile.children,
              profile.prayer,
              profile.familyType,
              profile.preferences?.matrimonialGoal,
              `${profile.matchScore || profile.compatibility || 80}% compatibility`,
              `${(profile.verification || []).join(", ")} verified`,
            ]}
          />
          <PrimaryButton title="Send Like" onPress={onLike} />
          <SecondaryButton title="Block Profile" onPress={onBlock} />
        </View>
      </View>
    </Modal>
  );
}

export function MatchModal({ visible, onClose, navigate }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.matchBackdrop}>
        <Card style={styles.matchCard}>
          <View style={styles.matchHeart}>
            <Icon name="heart" color={colors.text} />
          </View>
          <Text style={type.h1}>It's a Match!</Text>
          <Text style={styles.bodySoft}>مبارک ہو - May Allah bless this connection.</Text>
          <PrimaryButton title="Send a message" onPress={() => navigate("chat")} />
          <Pressable onPress={onClose}>
            <Text style={styles.goldLink}>Keep browsing</Text>
          </Pressable>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { gap: spacing.lg },
  scrollPadded: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  withBottomNav: { paddingBottom: 112 },
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  welcomeHero: { flex: 1.62, justifyContent: "flex-end", overflow: "hidden" },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  languagePill: { position: "absolute", top: spacing.xl, right: spacing.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(0,0,0,0.48)", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  languageText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  welcomeCopy: { gap: spacing.lg, padding: spacing.xl, paddingBottom: spacing.xxl },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  brandName: { color: colors.text, fontSize: 22, fontWeight: "900" },
  brandSmall: { color: colors.text, fontSize: 18, fontWeight: "900" },
  bodySoft: { ...type.small },
  welcomeActions: { flex: 1, gap: spacing.md, padding: spacing.xl, backgroundColor: colors.bg },
  inlineNote: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  noteText: { ...type.small, flexShrink: 1 },
  choiceGrid: { flexDirection: "row", gap: spacing.md },
  identityCard: { flex: 1, minHeight: 176, alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadow.card },
  identitySelected: { borderColor: colors.gold, ...shadow.glow },
  silhouette: { width: 72, height: 72, alignItems: "center", justifyContent: "center", borderRadius: 36, borderWidth: 2, borderColor: "rgba(212,175,55,0.5)", backgroundColor: "rgba(255,255,255,0.08)" },
  identityTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  identityUrdu: { color: colors.textSoft, fontSize: 16 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  optionRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 72, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", padding: spacing.md, marginTop: spacing.md },
  optionSelected: { borderWidth: 1, borderColor: "rgba(212,175,55,0.35)", backgroundColor: "rgba(212,175,55,0.08)" },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.gold },
  radioSelected: { backgroundColor: colors.gold, borderWidth: 7, borderColor: colors.bgThree },
  optionTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  checkBox: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 6, borderWidth: 1, borderColor: "rgba(212,175,55,0.55)" },
  checkBoxOn: { backgroundColor: colors.gold },
  stickyButton: { marginTop: "auto" },
  centeredCard: { alignItems: "stretch", gap: spacing.md },
  authIcon: { width: 92, height: 92, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: 28, backgroundColor: colors.purple, ...shadow.glow },
  authLinks: { gap: spacing.md, alignItems: "center" },
  fieldLabel: { color: colors.textSoft, fontSize: 13, fontWeight: "800" },
  otpRow: { flexDirection: "row", gap: spacing.sm, marginVertical: spacing.xl },
  otpBox: { flex: 1, minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: "rgba(212,175,55,0.44)", backgroundColor: "rgba(255,255,255,0.06)", color: colors.text, textAlign: "center", fontSize: 24, fontWeight: "900" },
  goldLink: { color: colors.gold, fontSize: 13, fontWeight: "800", textAlign: "center" },
  savedText: { color: colors.success, fontSize: 11, fontWeight: "800", maxWidth: 92, textAlign: "right" },
  uploadCard: { alignItems: "center", gap: spacing.md },
  formGrid: { gap: spacing.md, marginTop: spacing.md },
  twoCol: { flexDirection: "row", gap: spacing.md },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  summaryList: { gap: spacing.sm, marginTop: spacing.md },
  summaryItem: { borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", padding: spacing.md },
  homeContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 112, gap: spacing.md },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  prayerWidget: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  profileCard: { minHeight: 510, overflow: "hidden", borderRadius: radius.lg, backgroundColor: colors.bgTwo, ...shadow.card },
  emptyCard: { minHeight: 360, alignItems: "center", justifyContent: "center", gap: spacing.md },
  profileShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.34)" },
  badgeStack: { position: "absolute", top: spacing.md, right: spacing.md, flexDirection: "row", gap: spacing.sm },
  photoPrivacy: { position: "absolute", top: "43%", alignSelf: "center", flexDirection: "row", alignItems: "center", gap: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(0,0,0,0.48)", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  privacyText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  profileOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, gap: spacing.sm, padding: spacing.xl, backgroundColor: "rgba(0,0,0,0.45)" },
  detailsButton: { alignSelf: "flex-start", minHeight: 40, justifyContent: "center", borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.14)", paddingHorizontal: spacing.md, marginTop: spacing.sm },
  detailsText: { color: colors.text, fontWeight: "800" },
  swipeActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  roundAction: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 29, backgroundColor: colors.surfaceTwo, ...shadow.card },
  roundLike: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success },
  roundSuper: { backgroundColor: "rgba(212,175,55,0.14)", ...shadow.glow },
  roundPass: { backgroundColor: "rgba(139,21,56,0.18)" },
  roundBlock: { backgroundColor: "rgba(139,21,56,0.26)" },
  roundInfo: { width: 50, height: 50, borderRadius: 25 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  segmented: { flexDirection: "row", gap: spacing.xs, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.06)", padding: spacing.xs },
  segment: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  segmentActive: { backgroundColor: "rgba(212,175,55,0.2)" },
  segmentText: { color: colors.textSoft, fontSize: 12, fontWeight: "800" },
  segmentTextActive: { color: colors.text },
  listGap: { gap: spacing.md },
  matchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.05)", padding: spacing.md },
  matchRowNew: { borderLeftWidth: 4, borderLeftColor: colors.gold },
  previewText: { color: colors.textSoft, fontSize: 12, marginTop: spacing.xs },
  unreadBadge: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.error },
  unreadText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  chatScroll: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: 106 },
  safetyBanner: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: "rgba(243,156,18,0.12)" },
  safetyText: { ...type.small, color: "#FFE6A4", flex: 1 },
  messageBubble: { maxWidth: "82%", borderRadius: 18, padding: spacing.md },
  messageReceived: { alignSelf: "flex-start", borderBottomLeftRadius: 6, backgroundColor: colors.bgThree },
  messageSent: { alignSelf: "flex-end", borderBottomRightRadius: 6, backgroundColor: colors.gold },
  messageText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  messageTime: { color: "rgba(255,255,255,0.68)", fontSize: 11, marginTop: spacing.xs },
  composer: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderRadius: radius.lg, backgroundColor: "rgba(26,26,26,0.98)", padding: spacing.sm, ...shadow.card },
  composerInput: { flex: 1, minHeight: 44, borderRadius: radius.sm, backgroundColor: colors.bgThree, color: colors.text, paddingHorizontal: spacing.md },
  sendButton: { backgroundColor: colors.gold },
  profileSummary: { alignItems: "center", gap: spacing.md },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statTile: { width: "48%", minHeight: 118, justifyContent: "center", gap: spacing.sm },
  settingsRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.05)", padding: spacing.md },
  tierCard: { gap: spacing.md },
  goldTier: { borderColor: "rgba(212,175,55,0.58)", backgroundColor: "rgba(212,175,55,0.12)", ...shadow.glow },
  platinumTier: { backgroundColor: "rgba(220,225,232,0.12)" },
  priceText: { color: colors.gold, fontSize: 18, fontWeight: "900" },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  method: { width: "48%", minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: "rgba(255,255,255,0.06)" },
  safetyHero: { gap: spacing.md, backgroundColor: "rgba(44,95,79,0.22)" },
  centerText: { textAlign: "center" },
  familyIcon: { width: 92, height: 92, alignItems: "center", justifyContent: "center", borderRadius: 46, backgroundColor: colors.teal, ...shadow.glow },
  notificationRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.72)" },
  sheet: { maxHeight: "90%", gap: spacing.lg, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: "#171717", padding: spacing.lg },
  sheetHandle: { width: 46, height: 5, alignSelf: "center", borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.22)" },
  detailHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  detailCopy: { ...type.body, color: colors.textSoft },
  matchBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.78)", padding: spacing.xl },
  matchCard: { width: "100%", alignItems: "center", gap: spacing.lg, borderColor: "rgba(212,175,55,0.34)" },
  matchHeart: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 29, backgroundColor: colors.gold },
});
