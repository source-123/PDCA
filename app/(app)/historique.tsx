import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/States";
import { listHistory, HistoryEntry } from "@/services/pdcaService";
import { theme } from "@/theme";

const EVENT_LABELS: Record<string, string> = {
  PDCA_CREATED: "PDCA créé",
  PDCA_CANCELLED: "PDCA annulé",
  ACTION_CREATED: "Action créée",
  ACTION_UPDATED: "Action modifiée",
  ACTION_COMPLETED: "Action terminée",
  PHASE_CHANGED: "Phase modifiée",
  PILOT_CHANGED: "Pilote modifié",
  DUE_DATE_CHANGED: "Échéance modifiée",
  PRIORITY_CHANGED: "Priorité modifiée",
};

function fmt(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mn}`;
}

export default function HistoriqueScreen() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setItems(await listHistory(300));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.sub}>{items.length} événement(s)</Text>
      </View>

      {items.length === 0 ? (
        <EmptyState title="Aucun événement" />
      ) : (
        <FlatList<HistoryEntry>
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          data={items}
          keyExtractor={(it: HistoryEntry) => it.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
            />
          }
          renderItem={({ item }: { item: HistoryEntry }) => (
            <Card>
              <Text style={styles.date}>{fmt(item.created_at)}</Text>
              <Text style={styles.event}>
                {EVENT_LABELS[item.event_type] ?? item.event_type}
              </Text>
              {item.old_value || item.new_value ? (
                <Text style={styles.change}>
                  {item.old_value ?? "—"} → {item.new_value ?? "—"}
                </Text>
              ) : null}
              {item.pdca_reference ? (
                <Text style={styles.ref}>PDCA {item.pdca_reference}</Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: theme.colors.text },
  sub: { color: theme.colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, color: theme.colors.textMuted },
  event: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 4,
  },
  change: { fontSize: 14, color: theme.colors.text, marginTop: 4 },
  ref: { fontSize: 12, color: theme.colors.primary, marginTop: 6 },
});
