import React from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius, shadow, spacing, type } from "./theme";

const glyphs = {
  back: "‹",
  close: "×",
  filter: "≡",
  bell: "!",
  shield: "✓",
  star: "★",
  users: "◦",
  camera: "◎",
  lock: "▣",
  home: "⌂",
  grid: "□",
  chat: "◌",
  user: "○",
  heart: "♥",
  info: "i",
  pass: "×",
  send: "›",
  bolt: "ϟ",
  eye: "◉",
  moon: "◐",
  more: "…",
  pin: "⌖",
  chevronDown: "⌄",
};

export function Icon({ name, size = 20, color = colors.text }) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.icon, { color, fontSize: size, lineHeight: size + 2 }]}
    >
      {glyphs[name] || "•"}
    </Text>
  );
}

export function AppLogo({ size = 48 }) {
  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View style={[styles.logoCore, { width: size * 0.38, height: size * 0.38 }]} />
    </View>
  );
}

export function PrimaryButton({ title, onPress, style, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, style, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ name, onPress, label, color = colors.text, style, disabled }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, disabled && styles.disabled, pressed && styles.pressed, style]}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}

export function Header({ eyebrow, title, onBack, right }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack ? <IconButton name="back" label="Back" onPress={onBack} /> : null}
        <View style={styles.headerCopy}>
          {eyebrow ? <Text style={type.eyebrow}>{eyebrow}</Text> : null}
          <Text style={type.h2}>{title}</Text>
        </View>
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, tone = "default", style }) {
  const toneStyle =
    tone === "gold"
      ? styles.pillGold
      : tone === "success"
        ? styles.pillSuccess
        : tone === "info"
          ? styles.pillInfo
          : null;

  return (
    <View style={[styles.pill, toneStyle, style]}>
      <Text style={[styles.pillText, toneStyle && styles.pillTextStrong]}>{label}</Text>
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ icon, tone = "gold" }) {
  const color =
    tone === "success" ? colors.success : tone === "info" ? colors.info : colors.gold;

  return (
    <View style={styles.badge}>
      <Icon name={icon} color={color} size={16} />
    </View>
  );
}

export function Avatar({ uri, size = 58, style }) {
  return (
    <Image
      source={{
        uri:
          uri ||
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80",
      }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

export function ProgressBar({ value }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

export function Field({
  label,
  value,
  placeholder,
  onChangeText,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

export function SelectField({ label, value, options, onChange, placeholder = "Select an option" }) {
  const [open, setOpen] = React.useState(false);
  const displayValue = value || placeholder;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayValue}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}
      >
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {displayValue}
        </Text>
        <Icon name="chevronDown" color={colors.gold} size={16} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.selectBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.selectSheet}>
            <Text style={styles.selectTitle}>{label}</Text>
            {options.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  style={[styles.selectOption, selected && styles.selectOptionActive]}
                >
                  <Text style={[styles.selectOptionText, selected && styles.selectOptionTextActive]}>
                    {option}
                  </Text>
                  {selected ? <Icon name="shield" color={colors.gold} size={14} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export function BottomNav({ active, navigate, openFilters }) {
  const items = [
    ["home", "Home", "home"],
    ["grid", "Explore", "filters"],
    ["heart", "Matches", "matches"],
    ["chat", "Messages", "chat"],
    ["user", "Profile", "settings"],
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map(([icon, label, target]) => {
        const isActive = active === target;
        return (
          <Pressable
            key={target}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => (target === "filters" ? openFilters() : navigate(target))}
            style={[styles.navItem, isActive && styles.navItemActive]}
          >
            <Icon name={icon} color={isActive ? colors.gold : colors.textSoft} size={19} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const styles = StyleSheet.create({
  icon: {
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },
  logo: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 7,
    borderColor: colors.purple,
    ...shadow.glow,
  },
  logoCore: {
    borderRadius: 999,
    backgroundColor: colors.bgTwo,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
  },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gold,
    ...shadow.glow,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "800",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.48,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadow.card,
  },
  pill: {
    minHeight: 30,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillGold: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderColor: "rgba(212,175,55,0.36)",
  },
  pillSuccess: {
    backgroundColor: "rgba(46,204,113,0.16)",
    borderColor: "rgba(46,204,113,0.28)",
  },
  pillInfo: {
    backgroundColor: "rgba(52,152,219,0.16)",
    borderColor: "rgba(52,152,219,0.28)",
  },
  pillText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  pillTextStrong: {
    color: colors.text,
  },
  chip: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  chipSelected: {
    borderColor: "rgba(212,175,55,0.48)",
    backgroundColor: "rgba(212,175,55,0.14)",
  },
  chipText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  chipTextSelected: {
    color: colors.gold,
  },
  badge: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "rgba(212,175,55,0.42)",
    backgroundColor: colors.bgThree,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: colors.bgThree,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  selectButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)",
    backgroundColor: colors.bgThree,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  selectPlaceholder: {
    color: colors.textFaint,
  },
  selectBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  selectSheet: {
    gap: spacing.sm,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#171717",
    padding: spacing.lg,
  },
  selectTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  selectOption: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: spacing.md,
  },
  selectOptionActive: {
    borderColor: "rgba(212,175,55,0.55)",
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  selectOptionText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: "700",
  },
  selectOptionTextActive: {
    color: colors.text,
  },
  textarea: {
    minHeight: 118,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  bottomNav: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(18,18,18,0.96)",
    padding: spacing.sm,
    ...shadow.card,
  },
  navItem: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    gap: 3,
  },
  navItemActive: {
    backgroundColor: "rgba(212,175,55,0.13)",
  },
  navLabel: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "700",
  },
  navLabelActive: {
    color: colors.gold,
  },
});
