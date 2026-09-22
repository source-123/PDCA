import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import type { ActionStatus, Priority } from "@/types/database";
import { PRIORITY_COLORS } from "@/constants/options";

const STATUS_LABELS: Record<ActionStatus, string> = {
  OPEN: "Ouvert", IN_PROGRESS: "En cours", COMPLETED: "Terminé",
  CANCELLED: "Annulé", OVERDUE: "En retard",
};
const STATUS_COLORS: Record<ActionStatus, string> = {
  OPEN: theme.colors.info, IN_PROGRESS: theme.colors.warning,
  COMPLETED: theme.colors.success, CANCELLED: theme.colors.textMuted,
  OVERDUE: theme.colors.danger,
};

export function StatusBadge({ status }: { status: ActionStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + "22", borderColor: STATUS_COLORS[status] }]}>
      <Text style={[styles.txt, { color: STATUS_COLORS[status] }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLORS[priority];
  const label = priority === "LOW" ? "Faible" : priority === "MEDIUM" ? "Moyenne" : "Élevée";
  return (
    <View style={[styles.badge, { backgroundColor: c + "22", borderColor: c }]}>
      <Text style={[styles.txt, { color: c }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  txt: { fontSize: 12, fontWeight: "700" },
});
