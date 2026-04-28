import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PledgeRequest {
  session_id: string;
  email: string;
  name: string;
  firm?: string;
  amount_nok: number;
  is_firm: boolean;
  conditions?: string;
  preferred_valuation_nok?: number;
  lead_intent?: "lead" | "co_lead" | "follow";
  notes?: string;
}

const VALID_LEAD_INTENTS = new Set(["lead", "co_lead", "follow"]);

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
    const body = (await req.json()) as PledgeRequest;

    const session_id = body.session_id;
    const email = (body.email ?? "").trim().toLowerCase();
    const name = (body.name ?? "").trim();
    const firm = body.firm ? body.firm.trim() : null;
    const conditions = body.conditions ? body.conditions.trim() : null;
    const notes = body.notes ? body.notes.trim() : null;
    const lead_intent = body.lead_intent ?? null;
    const amount_nok = Number(body.amount_nok);
    const preferred_valuation_nok =
      body.preferred_valuation_nok != null ? Number(body.preferred_valuation_nok) : null;
    const is_firm = Boolean(body.is_firm);

    if (!session_id) return json({ success: false, error: "session_id required" }, 400);
    if (!email) return json({ success: false, error: "email required" }, 400);
    if (!name) return json({ success: false, error: "name required" }, 400);
    if (!Number.isFinite(amount_nok) || amount_nok <= 0) {
      return json({ success: false, error: "amount_nok must be > 0" }, 400);
    }
    if (preferred_valuation_nok != null && !Number.isFinite(preferred_valuation_nok)) {
      return json({ success: false, error: "preferred_valuation_nok invalid" }, 400);
    }
    if (lead_intent != null && !VALID_LEAD_INTENTS.has(lead_intent)) {
      return json({ success: false, error: "invalid lead_intent" }, 400);
    }
    if (notes && notes.length > 5000) {
      return json({ success: false, error: "notes too long" }, 400);
    }
    if (conditions && conditions.length > 5000) {
      return json({ success: false, error: "conditions too long" }, 400);
    }
    if (firm && firm.length > 200) {
      return json({ success: false, error: "firm too long" }, 400);
    }
    if (name.length > 200) {
      return json({ success: false, error: "name too long" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error: sessionError } = await supabase
      .from("investor_sessions")
      .select("id, email")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionError) {
      console.error("Failed to load session:", sessionError);
      return json({ success: false, error: "Failed to load session" }, 500);
    }
    if (!session) {
      return json({ success: false, error: "Session not found" }, 404);
    }
    if (session.email !== email) {
      return json({ success: false, error: "Email does not match session" }, 403);
    }

    const { data: existing, error: existingError } = await supabase
      .from("investor_pledges")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("Failed to check existing pledge:", existingError);
      return json({ success: false, error: "Failed to check pledge" }, 500);
    }

    const isRevision = !!existing;
    const now = new Date().toISOString();

    const { error: upsertError } = await supabase
      .from("investor_pledges")
      .upsert(
        {
          email,
          name,
          firm,
          amount_nok,
          is_firm,
          conditions,
          preferred_valuation_nok,
          lead_intent,
          notes,
          updated_at: now,
        },
        { onConflict: "email" }
      );

    if (upsertError) {
      console.error("Failed to upsert pledge:", upsertError);
      return json({ success: false, error: "Failed to save pledge" }, 500);
    }

    await supabase.from("investor_events").insert({
      session_id: session.id,
      email,
      event_type: isRevision ? "pledge_revised" : "pledge_submitted",
      payload: { amount_nok, is_firm, lead_intent },
    });

    return json({ success: true, data: { is_revision: isRevision } });
  } catch (error) {
    console.error("submit-pledge error:", error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
