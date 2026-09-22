import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Card } from "@/components/Card";
import { ActionCard } from "@/components/ActionCard";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { ErrorState, LoadingState } from "@/components/States";
import { getPDCA, updateActionPhase, cancelPDCA, PDCAWithActions } from "@/services/pdcaService";
import { useAuth } from "@/hooks/useAuth";
import type { PDCAPhase } from "@/types/database";
import { theme } from "@/theme";

export default function PDCADetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [item, setItem] = useState<PDCAWithActions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try { setError(null); setItem(await getPDCA(id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Erreur"); }
  }, [id]);

  useEffect(() => { (async () => { setLoading(true); await load(); setLoading(false); })(); }, [load]);

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} />;
  if (!item)   return <ErrorState message="PDCA introuvable." />;

  const changePhase = async (actionId: string, prev: PDCAPhase, next: PDCAPhase) => {
    if (!session?.user) return;
    try {
      await updateActionPhase(actionId, next, session.user.id, prev);
      await load();
    } catch (e) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <View style={styles.row}>
          <Text style={styles.ref}>{item.reference}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.meta}>
          {item.line} • {item.department ?? "—"} • {item.defect_type ?? "—"}
        </Text>
        <View style={{ marginTop: 8 }}>
          <PriorityBadge priority={item.priority} />
        </View>
      </Card>

      <Text style={styles.section}>Actions ({item.pdca_actions.length})</Text>
      {item.pdca_actions.map((a, i) => (
        <ActionCard
          key={a.id}
          index={i}
          action={a}
          priority={item.priority}
          onPhaseChange={(next) => changePhase(a.id, a.phase, next)}
        />
      ))}

      <Button
        label="Annuler ce PDCA"
        variant="danger"
        onPress={async () => {
          if (!session?.user) return;
          try { await cancelPDCA(item.id, session.user.id); await load(); }
          catch (e) { Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur"); }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: theme.colors.bg, paddingBottom: 40 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ref: { fontWeight: "700", color: theme.colors.primary },
  subject: { fontSize: 17, fontWeight: "600", marginTop: 8, color: theme.colors.text },
  meta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  section: { fontSize: 16, fontWeight: "700", marginVertical: 8, color: theme.colors.text },
});
