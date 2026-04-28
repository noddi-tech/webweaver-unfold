import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptNdaRequest {
  session_id: string;
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
    const { session_id } = (await req.json()) as AcceptNdaRequest;
    if (!session_id || typeof session_id !== "string") {
      return json({ success: false, error: "session_id is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error: sessionError } = await supabase
      .from("investor_sessions")
      .select("id, email, started_at")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionError) {
      console.error("Failed to load session:", sessionError);
      return json({ success: false, error: "Failed to load session" }, 500);
    }
    if (!session) {
      return json({ success: false, error: "Session not found" }, 404);
    }

    const ageMs = Date.now() - new Date(session.started_at).getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      return json({ success: false, error: "Session expired" }, 401);
    }

    const { data: currentNda, error: ndaError } = await supabase
      .from("nda_versions")
      .select("id")
      .eq("is_current", true)
      .maybeSingle();

    if (ndaError || !currentNda) {
      console.error("No current NDA:", ndaError);
      return json({ success: false, error: "No current NDA configured" }, 500);
    }

    const xff = req.headers.get("x-forwarded-for");
    const ipAddress = xff ? xff.split(",")[0].trim() : null;
    const userAgent = req.headers.get("user-agent");

    const { error: insertError } = await supabase
      .from("nda_acceptances")
      .insert({
        session_id: session.id,
        email: session.email,
        nda_version_id: currentNda.id,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error("Failed to insert NDA acceptance:", insertError);
      return json({ success: false, error: "Failed to record acceptance" }, 500);
    }

    await supabase.from("investor_events").insert({
      session_id: session.id,
      email: session.email,
      event_type: "nda_accepted",
      payload: { nda_version_id: currentNda.id },
    });

    return json({ success: true });
  } catch (error) {
    console.error("accept-nda error:", error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
