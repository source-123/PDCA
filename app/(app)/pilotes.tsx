import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { Card } from "@/components/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/States";
import { listPilotSummaries, PilotSummary } from "@/services/pdcaService";
import { theme } from "@/theme";

export default function PilotesScreen() {
  const [items, setItems] = useState<PilotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setItems(await listPilotSummaries());
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

  const total = useMemo(
    () => items.reduce((s, p) => s + p.total_actions, 0),
    [items],
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Pilotes</Text>
        <Text style={styles.sub}>
          {items.length} pilote(s) • {total} action(s) au total
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState title="Aucun pilote" subtitle="Aucune action assignée." />
      ) : (
        <FlatList<PilotSummary>
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          data={items}
          keyExtractor={(it: PilotSummary) => it.pilot_name}
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
          renderItem={({ item }: { item: PilotSummary }) => (
            <Card>
              <Text style={styles.pilot}>{item.pilot_name}</Text>
              <View style={styles.grid}>
                <Metric n={item.pdca_ids.length} l="PDCA" />
                <Metric n={item.open_actions} l="Ouvertes" />
                <Metric n={item.overdue_actions} l="En retard" danger />
                <Metric n={item.completed_actions} l="Terminées" />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

function Metric({
  n,
  l,
  danger,
}: {
  n: number;
  l: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricN, danger && { color: theme.colors.danger }]}>
        {n}
      </Text>
      <Text style={styles.metricL}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: theme.colors.text },
  sub: { color: theme.colors.textMuted, marginTop: 4 },
  pilot: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  grid: { flexDirection: "row", marginTop: 12, gap: 12 },
  metric: { flex: 1 },
  metricN: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  metricL: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
});
