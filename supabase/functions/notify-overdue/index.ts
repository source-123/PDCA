// Supabase Edge Function — runs daily via pg_cron to notify pilots of overdue actions.
// Secrets used: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set via `supabase secrets set`).

// @ts-nocheck — Deno runtime, types come from deno.land/x
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async () => {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(url, key);

    const today = new Date().toISOString().slice(0, 10);
    const { data: overdue, error } = await supabase
      .from("pdca_actions")
      .select("id, pilot_name, action, due_date, pdca_id")
      .lt("due_date", today)
      .not("status", "in", "(COMPLETED,CANCELLED)");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!overdue || overdue.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no overdue" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Group overdue actions by pilot_name.
    const byPilot = new Map<string, typeof overdue>();
    for (const a of overdue) {
      const k = a.pilot_name ?? "—";
      if (!byPilot.has(k)) byPilot.set(k, []);
      byPilot.get(k)!.push(a);
    }

    // Look up push tokens by matching pilot name to profiles.full_name.
    // If you prefer to key pilots by profiles.id, add a `pilot_id` FK to pdca_actions
    // and join on that instead — that is the more robust design.
    const pilotNames = [...byPilot.keys()];
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("full_name, expo_push_token")
      .in("full_name", pilotNames)
      .not("expo_push_token", "is", null);

    if (pErr) {
      return new Response(JSON.stringify({ error: pErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages = (profiles ?? []).flatMap((p) => {
      const list = byPilot.get(p.full_name);
      if (!list || list.length === 0 || !p.expo_push_token) return [];
      return [{
        to: p.expo_push_token,
        sound: "default",
        title: "Actions en retard",
        body: `${list.length} action(s) en retard vous sont assignées.`,
        data: { type: "overdue", count: list.length },
      }];
    });

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, reason: "no token matched a pilot name" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });
    const json = await res.json();

    return new Response(
      JSON.stringify({ sent: messages.length, expo: json }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
