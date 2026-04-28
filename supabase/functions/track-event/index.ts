import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_EVENT_TYPES = new Set([
  "session_start", "session_end",
  "tab_view", "tab_exit",
  "slide_view", "slide_exit",
  "pdf_export", "link_click",
  "pledge_submitted", "pledge_revised",
  "nda_accepted",
]);

interface IncomingEvent {
  event_type: string;
  path?: string;
  payload?: Record<string, unknown>;
  dwell_seconds?: number;
}

interface TrackRequest {
  session_id: string;
  events: IncomingEvent[];
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const { session_id, events } = (await req.json()) as TrackRequest;
    if (!session_id) return json({ success: false, error: "session_id required" }, 400);
    if (!Array.isArray(events) || events.length === 0) {
      return json({ success: false, error: "events must be a non-empty array" }, 400);
    }
    if (events.length > 200) {
      return json({ success: false, error: "too many events in batch" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error: sessionError } = await supabase
      .from("investor_sessions")
      .select("id, email, total_dwell_seconds")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionError) {
      console.error("Failed to load session:", sessionError);
      return json({ success: false, error: "Failed to load session" }, 500);
    }
    if (!session) {
      return json({ success: false, error: "Session not found" }, 404);
    }

    const valid: Array<{
      session_id: string;
      email: string;
      event_type: string;
      path: string | null;
      payload: Record<string, unknown>;
      dwell_seconds: number | null;
    }> = [];
    const failures: Array<{ index: number; reason: string }> = [];
    let dwellSum = 0;

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (!e || typeof e !== "object") {
        failures.push({ index: i, reason: "not an object" });
        continue;
      }
      if (!VALID_EVENT_TYPES.has(e.event_type)) {
        failures.push({ index: i, reason: `invalid event_type: ${e.event_type}` });
        continue;
      }
      const path = e.path != null ? String(e.path).slice(0, 1000) : null;
      const payload = e.payload && typeof e.payload === "object" ? e.payload : {};
      let dwell: number | null = null;
      if (e.dwell_seconds != null) {
        const d = Number(e.dwell_seconds);
        if (!Number.isFinite(d) || d < 0 || d > 86400) {
          failures.push({ index: i, reason: "invalid dwell_seconds" });
          continue;
        }
        dwell = Math.round(d);
        dwellSum += dwell;
      }
      valid.push({
        session_id: session.id,
        email: session.email,
        event_type: e.event_type,
        path,
        payload,
        dwell_seconds: dwell,
      });
    }

    let inserted = 0;
    if (valid.length > 0) {
      const { error: insertError, count } = await supabase
        .from("investor_events")
        .insert(valid, { count: "exact" });
      if (insertError) {
        console.error("Failed to insert events:", insertError);
        return json({ success: false, error: "Failed to insert events" }, 500);
      }
      inserted = count ?? valid.length;
    }

    const { error: updateError } = await supabase
      .from("investor_sessions")
      .update({
        last_seen_at: new Date().toISOString(),
        total_dwell_seconds: (session.total_dwell_seconds ?? 0) + dwellSum,
      })
      .eq("id", session.id);

    if (updateError) {
      console.error("Failed to update session:", updateError);
    }

    return json({
      success: true,
      data: { inserted, failed: failures.length, failures },
    });
  } catch (error) {
    console.error("track-event error:", error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
