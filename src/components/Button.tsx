import React, { forwardRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { theme } from "@/theme";

type Variant = "primary" | "secondary" | "danger";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button = forwardRef<View, Props>(function Button(
  { label, onPress, variant = "primary", loading, disabled, style },
  ref,
) {
  const bg =
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
        ? theme.colors.danger
        : theme.colors.surface;
  const fg = variant === "secondary" ? theme.colors.text : "#fff";

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "secondary" && styles.outline,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.txt, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  outline: { borderWidth: 1, borderColor: theme.colors.border },
  txt: { fontSize: 16, fontWeight: "600" },
});
