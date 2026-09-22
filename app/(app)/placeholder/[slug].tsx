import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theme } from "@/theme";

const TITLES: Record<string, string> = {
  graphiques: "Graphiques",
  rapport: "Rapport hebdomadaire",
  lessons: "Lessons Learned",
  tour: "Tour Usine",
};

export default function Placeholder() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        {TITLES[slug ?? ""] ?? "Fonctionnalité"}
      </Text>
      <Text style={styles.sub}>Disponible en Phase 3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: theme.colors.bg,
  },
  title: { fontSize: 22, fontWeight: "800", color: theme.colors.text },
  sub: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8 },
});
