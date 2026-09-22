import React from "react";
import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingState } from "@/components/States";
import { DrawerContent } from "@/components/DrawerContent";
import { theme } from "@/theme";

export default function AppLayout() {
  const { session, loading } = useAuth();
  useNotifications();
  if (loading) return <LoadingState />;
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        drawerType: "front",
        overlayColor: "transparent",
        swipeEdgeWidth: 60,
        swipeMinDistance: 40,
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: "Tableau de bord" }} />
      <Drawer.Screen name="pdca/index" options={{ title: "PDCA" }} />
      <Drawer.Screen name="pdca/new" options={{ title: "Nouveau PDCA" }} />
      <Drawer.Screen
        name="pdca/[id]"
        options={{ title: "Détail PDCA", drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="department/[dept]"
        options={{ title: "Département", drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen name="pilotes" options={{ title: "Pilotes" }} />
      <Drawer.Screen name="historique" options={{ title: "Historique" }} />
      <Drawer.Screen name="actions-annulees" options={{ title: "Actions annulées" }} />
      <Drawer.Screen name="graphiques" options={{ title: "Graphiques" }} />
      <Drawer.Screen name="rapport-hebdo" options={{ title: "Rapport hebdomadaire" }} />
      <Drawer.Screen name="lessons-learned" options={{ title: "Lessons Learned" }} />
      <Drawer.Screen name="tour-usine" options={{ title: "Tour Usine" }} />
      <Drawer.Screen
        name="placeholder/[slug]"
        options={{ title: "", drawerItemStyle: { display: "none" } }}
      />
    </Drawer>
  );
}
