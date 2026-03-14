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
      .eq("offer_token", offer_token)
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
      const currency = offer.currency || 'EUR';
      const conversionRate = offer.conversion_rate || 1;
      
      // Use pre-calculated total (includes discounts), converted to display currency
      const displayFixedMonthly = (offer.fixed_monthly || 0) * conversionRate;
      const displayMonthlyRevenue = ((offer.annual_revenue || 0) / 12) * conversionRate;
      const displayRevenueCost = displayMonthlyRevenue * ((offer.revenue_percentage || 0) / 100);
      const displayTotalMonthly = offer.total_monthly_estimate 
        ? offer.total_monthly_estimate * conversionRate 
        : displayFixedMonthly + displayRevenueCost;

      const CURRENCY_LOCALES: Record<string, string> = {
        EUR: 'de-DE', NOK: 'nb-NO', SEK: 'sv-SE', USD: 'en-US', GBP: 'en-GB'
      };
      const locale = CURRENCY_LOCALES[currency] || 'en-US';
      const formatCurrency = (amount: number) =>
        new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

      await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🎉 ${offer.customer_company} accepted the pricing offer!`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🎉 *${offer.customer_company}* accepted the pricing offer!`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Contact:*\n${offer.customer_name}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Email:*\n${offer.customer_email}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Plan:*\n${offer.tier}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Monthly Cost:*\n${formatCurrency(displayTotalMonthly)}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Locations:*\n${offer.locations}`,
                },
              ],
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `✅ Next step: Contact ${offer.customer_name} to finalize the agreement`,
                },
              ],
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "View Offer" },
                  url: `https://naviosolutions.com/offer/${offer.offer_token}`,
                  style: "primary" as const,
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
