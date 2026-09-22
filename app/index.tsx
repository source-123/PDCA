import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/States";

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return <View style={{ flex: 1 }}><LoadingState /></View>;
  return session ? <Redirect href="/(app)/dashboard" /> : <Redirect href="/(auth)/login" />;
}
