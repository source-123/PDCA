import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const configError =
  !url || !anon
    ? "Configuration Supabase manquante. Vérifiez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans eas.json / .env."
    : null;

// If config is missing, log it and fall back to placeholder values so the
// module never throws at import time. The UI reads `configError` to display
// a friendly screen instead of a white page.
if (configError) {
  console.error("[supabase] " + configError);
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
