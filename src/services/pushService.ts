import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface PushStatus {
  ok: boolean;
  message: string;
  token?: string;
}

export async function registerForPushNotifications(userId: string): Promise<PushStatus> {
  try {
    if (Platform.OS === "web") {
      return { ok: false, message: "Web: push non supporté" };
    }
    if (!Device.isDevice) {
      return { ok: false, message: "Émulateur: push non supporté (utilise un vrai téléphone)" };
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") {
      return { ok: false, message: `Permission refusée (status=${status})` };
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    if (!projectId) {
      return { ok: false, message: "projectId EAS manquant dans app.json" };
    }

    const resp = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = resp.data;

    const { error } = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", userId);
    if (error) {
      return { ok: false, message: `Supabase update: ${error.message}`, token };
    }

    return { ok: true, message: "Token enregistré", token };
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    return { ok: false, message: `Exception: ${msg}` };
  }
}

export async function unregisterPushToken(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await supabase.from("profiles").update({ expo_push_token: null }).eq("id", userId);
}
