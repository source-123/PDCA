import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

// Foreground notification handler (native only).
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

export async function registerForPushNotifications(userId: string): Promise<void> {
  // Web push needs a service worker + VAPID setup, out of scope for this phase.
  if (Platform.OS === "web") return;

  // Simulators/emulators cannot receive push from Expo.
  if (!Device.isDevice) {
    console.log("[push] skipped: not a physical device");
    return;
  }

  // Android needs a notification channel before requesting permission.
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
    console.log("[push] permission denied");
    return;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig?.projectId;
  if (!projectId) {
    console.warn("[push] missing EAS projectId — see README");
    return;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  const { error } = await supabase
    .from("profiles")
    .update({ expo_push_token: token })
    .eq("id", userId);
  if (error) {
    console.warn("[push] failed to save token:", error.message);
  } else {
    console.log("[push] token registered");
  }
}

export async function unregisterPushToken(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await supabase
    .from("profiles")
    .update({ expo_push_token: null })
    .eq("id", userId);
}
