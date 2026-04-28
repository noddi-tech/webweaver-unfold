import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateRequest {
  name: string;
  email: string;
  password: string;
  firm?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_FAILURES = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

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
    const portalPassword = Deno.env.get("NAVIO_PORTAL_PASSWORD");
    if (!portalPassword) {
      console.error("NAVIO_PORTAL_PASSWORD not configured");
      return json({ success: false, error: "Portal not configured" }, 500);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const xff = req.headers.get("x-forwarded-for");
    const ipAddress = xff ? xff.split(",")[0].trim() : null;
    const userAgent = req.headers.get("user-agent");
    const referrer = req.headers.get("referer") ?? req.headers.get("referrer");

    if (ipAddress) {
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count, error: rlError } = await supabase
        .from("access_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ipAddress)
        .eq("success", false)
        .gte("attempted_at", windowStart);
      if (rlError) {
        console.error("Rate limit lookup failed:", rlError);
      } else if ((count ?? 0) >= RATE_LIMIT_FAILURES) {
        return json(
          { success: false, error: "Too many attempts. Please try again in a few minutes." },
          429
        );
      }
    }

    const body = (await req.json()) as ValidateRequest;
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const firm = body.firm ? body.firm.trim() : null;
    const password = body.password ?? "";

    const passwordOk = password === portalPassword;

    if (ipAddress) {
      await supabase.from("access_attempts").insert({
        ip_address: ipAddress,
        email: email || null,
        success: passwordOk,
      });
    }

    if (!passwordOk) {
      return json({ success: false, error: "Invalid access code" }, 401);
    }

    if (!name || name.length > 200) {
      return json({ success: false, error: "Name is required" }, 400);
    }
    if (!email || !EMAIL_RE.test(email) || email.length > 320) {
      return json({ success: false, error: "Valid email is required" }, 400);
    }
    if (firm && firm.length > 200) {
      return json({ success: false, error: "Firm name too long" }, 400);
    }

    const { data: session, error: sessionError } = await supabase
      .from("investor_sessions")
      .insert({
        name,
        email,
        firm,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Failed to create session:", sessionError);
      return json({ success: false, error: "Failed to create session" }, 500);
    }

    const { data: currentNda, error: ndaError } = await supabase
      .from("nda_versions")
      .select("id")
      .eq("is_current", true)
      .maybeSingle();

    if (ndaError) {
      console.error("Failed to load current NDA:", ndaError);
      return json({ success: false, error: "Failed to load NDA" }, 500);
    }

    let requiresNda = true;
    if (currentNda) {
      const { count, error: acceptError } = await supabase
        .from("nda_acceptances")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .eq("nda_version_id", currentNda.id);

      if (acceptError) {
        console.error("Failed to check NDA acceptance:", acceptError);
        return json({ success: false, error: "Failed to check NDA" }, 500);
      }
      requiresNda = (count ?? 0) === 0;
    }

    await supabase.from("investor_events").insert({
      session_id: session.id,
      email,
      event_type: "session_start",
    });

    return json({
      success: true,
      data: { session_id: session.id, requires_nda: requiresNda },
    });
  } catch (error) {
    console.error("validate-portal-access error:", error);
    return json({ success: false, error: (error as Error).message }, 500);
  }
});
