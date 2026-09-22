import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/Badges";
import { EmptyState, ErrorState, LoadingState } from "@/components/States";
import {
  listCancelledActions,
  CancelledAction,
} from "@/services/pdcaService";
import { theme } from "@/theme";

export default function ActionsAnnuleesScreen() {
  const [items, setItems] = useState<CancelledAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setItems(await listCancelledActions());
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
        <Text style={styles.title}>Actions annulées</Text>
        <Text style={styles.sub}>{items.length} action(s)</Text>
      </View>

      {items.length === 0 ? (
        <EmptyState title="Aucune action annulée" />
      ) : (
        <FlatList<CancelledAction>
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          data={items}
          keyExtractor={(it: CancelledAction) => it.id}
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
          renderItem={({ item }: { item: CancelledAction }) => (
            <Card>
              <View style={styles.row}>
                <Text style={styles.ref}>
                  {item.pdca_reference ?? "PDCA"}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.subject}>
                {item.pdca_subject ?? "—"}
              </Text>
              <Text style={styles.action}>{item.action}</Text>
              <Text style={styles.meta}>Pilote : {item.pilot_name}</Text>
              <Text style={styles.meta}>
                Ouverture : {item.opening_date}
                {item.due_date ? ` • Échéance : ${item.due_date}` : ""}
              </Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ref: { fontWeight: "700", color: theme.colors.primary },
  subject: { fontSize: 15, color: theme.colors.text, marginTop: 6 },
  action: { fontSize: 14, color: theme.colors.text, marginTop: 6 },
  meta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
});
