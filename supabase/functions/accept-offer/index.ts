import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptRequest {
  offer_token: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { offer_token }: AcceptRequest = await req.json();

    // Get the offer
    const { data: offer, error: offerError } = await supabase
      .from("pricing_offers")
      .select("*")
      .eq("token", offer_token)
      .single();

    if (offerError || !offer) {
      throw new Error("Offer not found");
    }

    // Check if already accepted
    if (offer.accepted_at) {
      return new Response(JSON.stringify({ 
        success: true, 
        already_accepted: true,
        accepted_at: offer.accepted_at 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if expired
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Offer has expired" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the offer
    const { error: updateError } = await supabase
      .from("pricing_offers")
      .update({ 
        accepted_at: new Date().toISOString(),
        status: "accepted"
      })
      .eq("id", offer.id);

    if (updateError) {
      throw updateError;
    }

    // Update linked lead status to 'won' if exists
    if (offer.lead_id) {
      const { error: leadError } = await supabase
        .from("leads")
        .update({ 
          status: "won",
          notes: `Offer accepted on ${new Date().toLocaleDateString()}`
        })
        .eq("id", offer.lead_id);

      if (leadError) {
        console.error("Error updating lead status:", leadError);
        // Don't throw - offer acceptance is more important
      } else {
        console.log("Lead status updated to 'won':", offer.lead_id);
      }
    }

    // Send Slack notification
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackWebhookUrl) {
      const monthlyCost = (offer.fixed_monthly_cost || 0) + 
        ((offer.estimated_monthly_revenue || 0) * (offer.revenue_percentage || 0) / 100);

      await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🎉 ${offer.company_name} accepted the pricing offer!`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🎉 *${offer.company_name}* accepted the pricing offer!`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Contact:*\n${offer.contact_name}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Email:*\n${offer.contact_email}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Plan:*\n${offer.tier}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Monthly Cost:*\n${monthlyCost.toLocaleString("nb-NO")} NOK`,
                },
                {
                  type: "mrkdwn",
                  text: `*Locations:*\n${offer.locations_included}`,
                },
              ],
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `✅ Next step: Contact ${offer.contact_name} to finalize the agreement`,
                },
              ],
            },
          ],
        }),
      });
    }

    console.log("Offer accepted:", offer.id);

    return new Response(JSON.stringify({ 
      success: true,
      accepted_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error accepting offer:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
