import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={styles.txt}>{label}</Text>
    </View>
  );
}
export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.txt}>{subtitle}</Text> : null}
    </View>
  );
}
export function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={[styles.title, { color: theme.colors.danger }]}>Erreur</Text>
      <Text style={styles.txt}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 16, fontWeight: "700", color: theme.colors.text, marginBottom: 6 },
  txt: { fontSize: 14, color: theme.colors.textMuted, textAlign: "center", marginTop: 6 },
});
