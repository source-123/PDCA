import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { registerForPushNotifications } from "@/services/pushService";

export function useNotifications(): void {
  const { session } = useAuth();
  useEffect(() => {
    if (!session?.user) return;
    registerForPushNotifications(session.user.id).catch((e) => {
      console.warn("[push] registration failed:", e);
    });
  }, [session?.user?.id]);
}
