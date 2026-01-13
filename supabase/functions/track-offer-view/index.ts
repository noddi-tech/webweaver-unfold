import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    if (!token) {
      throw new Error("Token is required");
    }

    // Get the offer by token
    const { data: offer, error: fetchError } = await supabase
      .from("pricing_offers")
      .select("id, viewed_at, status")
      .eq("offer_token", token)
      .single();

    if (fetchError || !offer) {
      console.log("Offer not found for token:", token);
      return new Response(
        JSON.stringify({ success: false, error: "Offer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only update if not already viewed
    if (!offer.viewed_at) {
      const { error: updateError } = await supabase
        .from("pricing_offers")
        .update({
          viewed_at: new Date().toISOString(),
          status: offer.status === "sent" ? "viewed" : offer.status,
        })
        .eq("id", offer.id);

      if (updateError) {
        console.error("Error updating offer:", updateError);
        throw new Error("Failed to update offer view status");
      }

      console.log("Offer view tracked:", offer.id);
    } else {
      console.log("Offer already viewed:", offer.id);
    }

    return new Response(
      JSON.stringify({ success: true, alreadyViewed: !!offer.viewed_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in track-offer-view:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
