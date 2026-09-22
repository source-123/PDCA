import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Card } from "@/components/Card";
import { ActionCard } from "@/components/ActionCard";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { ErrorState, LoadingState } from "@/components/States";
import {
  getPDCA,
  updateActionPhase,
  cancelPDCA,
  PDCAWithActions,
} from "@/services/pdcaService";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/ui/UIProvider";
import type { PDCAPhase } from "@/types/database";
import { theme } from "@/theme";

export default function PDCADetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { alert, confirm, toast } = useUI();
  const [item, setItem] = useState<PDCAWithActions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setItem(await getPDCA(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!item) return <ErrorState message="PDCA introuvable." />;

  const changePhase = async (
    actionId: string,
    prev: PDCAPhase,
    next: PDCAPhase,
  ) => {
    if (!session?.user) return;
    try {
      await updateActionPhase(actionId, next, session.user.id, prev);
      await load();
    } catch (e) {
      alert({
        title: "Erreur",
        message: e instanceof Error ? e.message : "Erreur inconnue",
      });
    }
  };

  const onCancel = async () => {
    const ok = await confirm({
      title: "Annuler ce PDCA ?",
      message: "Le PDCA sera marqué comme annulé. Réversible côté base.",
      confirmLabel: "Annuler le PDCA",
      destructive: true,
    });
    if (!ok || !session?.user) return;
    try {
      await cancelPDCA(item.id, session.user.id);
      toast.info("PDCA annulé");
      await load();
    } catch (e) {
      alert({
        title: "Erreur",
        message: e instanceof Error ? e.message : "Erreur",
      });
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

      {item.status !== "CANCELLED" ? (
        <Button label="Annuler ce PDCA" variant="danger" onPress={onCancel} />
      ) : (
        <Text style={styles.cancelled}>Ce PDCA est annulé.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.bg,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ref: { fontWeight: "700", color: theme.colors.primary },
  subject: { fontSize: 17, fontWeight: "600", marginTop: 8, color: theme.colors.text },
  meta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
  section: {
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 8,
    color: theme.colors.text,
  },
  cancelled: {
    marginTop: 12,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontWeight: "700",
  },
});
