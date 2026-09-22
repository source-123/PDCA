import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { theme } from "@/theme";

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
}

export function Input({ label, error, required, style, multiline, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}{required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
        style={[
          styles.input,
          multiline ? styles.multiline : undefined,
          error ? styles.inputError : undefined,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing(1.5) },
  label: { fontSize: 14, fontWeight: "600", color: theme.colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingHorizontal: 12, paddingVertical: 12,
    fontSize: 16, color: theme.colors.text, backgroundColor: theme.colors.surface,
    minHeight: 48,
  },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  inputError: { borderColor: theme.colors.danger },
  err: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
});
