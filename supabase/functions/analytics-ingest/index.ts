import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENPANEL_URL = (Deno.env.get("OPENPANEL_API_URL") ?? "https://analytics.noddi.co/api").replace(/\/$/, "");
const CLIENT_ID = Deno.env.get("OPENPANEL_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("OPENPANEL_CLIENT_SECRET") ?? "";
const PROJECT_ID = Deno.env.get("OPENPANEL_PROJECT_ID") ?? "navio-tech";

type IncomingEvent = {
  type?: "track" | "identify" | "increment" | "alias";
  name?: string;
  properties?: Record<string, unknown>;
  profileId?: string | null;
  deviceId?: string | null;
  timestamp?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    properties?: Record<string, unknown>;
  };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildPayload(event: IncomingEvent) {
  const type = event.type ?? "track";
  const timestamp = event.timestamp ?? new Date().toISOString();

  if (type === "identify") {
    return {
      type: "identify",
      payload: {
        profileId: String(event.profileId ?? ""),
        firstName: event.profile?.firstName,
        lastName: event.profile?.lastName,
        email: event.profile?.email,
        avatar: event.profile?.avatar,
        properties: { project: PROJECT_ID, ...(event.profile?.properties ?? {}) },
      },
    };
  }

  return {
    type: "track",
    payload: {
      name: String(event.name ?? "unknown_event").slice(0, 120),
      timestamp,
      deviceId: event.deviceId ?? undefined,
      profileId: event.profileId ?? undefined,
      properties: { project: PROJECT_ID, ...(event.properties ?? {}) },
    },
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("OpenPanel credentials missing");
    return json({ success: false, error: "Analytics not configured" }, 500);
  }

  try {
    const body = await req.json();
    const events: IncomingEvent[] = Array.isArray(body?.events) ? body.events : [];

    if (events.length === 0) return json({ success: false, error: "events must be a non-empty array" }, 400);
    if (events.length > 100) return json({ success: false, error: "too many events in batch" }, 400);

    const payloads = events
      .filter((event) => event && typeof event === "object")
      .map(buildPayload)
      .filter((entry) => entry.type !== "identify" || entry.payload.profileId);

    if (payloads.length === 0) return json({ success: false, error: "no valid events" }, 400);

    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const upstreamHeaders = {
      "Content-Type": "application/json",
      "openpanel-client-id": CLIENT_ID,
      "openpanel-client-secret": CLIENT_SECRET,
      "user-agent": req.headers.get("user-agent") ?? "navio-analytics-proxy",
      ...(forwardedFor ? { "x-client-ip": forwardedFor.split(",")[0].trim() } : {}),
    };

    // OpenPanel /track accepts one event object per request.
    const results = await Promise.all(
      payloads.map(async (entry) => {
        try {
          const response = await fetch(`${OPENPANEL_URL}/track`, {
            method: "POST",
            headers: upstreamHeaders,
            body: JSON.stringify(entry),
          });
          const text = await response.text();
          if (!response.ok) console.error("OpenPanel rejected event", response.status, text.slice(0, 300));
          return { ok: response.ok, status: response.status, body: text.slice(0, 300) };
        } catch (error) {
          console.error("OpenPanel request failed", error);
          return { ok: false, status: 0, body: (error as Error).message };
        }
      })
    );

    const accepted = results.filter((result) => result.ok).length;
    return json({ success: accepted > 0, sent: payloads.length, accepted, results }, accepted > 0 ? 200 : 502);

  } catch (error) {
    console.error("analytics-ingest error:", error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
