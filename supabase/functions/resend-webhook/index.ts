import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: ResendWebhookEvent = await req.json();
    console.log("Received Resend webhook:", event.type, event.data?.email_id);

    const resendId = event.data?.email_id;
    if (!resendId) {
      console.log("No email_id in webhook event");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map Resend event types to our status
    const statusMap: Record<string, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "delayed",
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.complained": "complained",
    };

    const status = statusMap[event.type];
    if (!status) {
      console.log("Unknown event type:", event.type);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update email_logs based on event type
    const updateData: Record<string, unknown> = { status };
    const timestampField = `${status === "complained" ? "bounced" : status}_at`;
    if (["delivered", "opened", "clicked", "bounced"].includes(status) || status === "complained") {
      updateData[timestampField] = new Date().toISOString();
    }

    const { data: emailLog, error: updateError } = await supabase
      .from("email_logs")
      .update(updateData)
      .eq("resend_id", resendId)
      .select()
      .single();

    if (updateError) {
      console.log("Error updating email log:", updateError);
    } else {
      console.log("Updated email log:", emailLog?.id, "to status:", status);
    }

    // For pricing offers, also update the offer record
    if (emailLog?.email_type === "pricing_offer" && emailLog?.related_id) {
      if (status === "opened") {
        await supabase
          .from("pricing_offers")
          .update({ viewed_at: new Date().toISOString() })
          .eq("id", emailLog.related_id);
        
        // Send Slack notification for offer opened
        await notifySlack(supabase, emailLog.related_id, "viewed");
      } else if (status === "bounced" || status === "complained") {
        await notifySlack(supabase, emailLog.related_id, "bounced");
      }
    }

    return new Response(JSON.stringify({ received: true, status }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function notifySlack(supabase: ReturnType<typeof createClient>, offerId: string, eventType: string) {
  try {
    const { data: offer } = await supabase
      .from("pricing_offers")
      .select("*")
      .eq("id", offerId)
      .single();

    if (!offer) return;

    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (!slackWebhookUrl) return;

    const emoji = eventType === "viewed" ? "👀" : "⚠️";
    const action = eventType === "viewed" ? "viewed their pricing offer" : "email bounced";

    await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${emoji} *${offer.company_name || "A customer"}* ${action}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${emoji} *${offer.company_name || "A customer"}* ${action}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Contact: ${offer.contact_name} (${offer.contact_email})`,
              },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    console.error("Error sending Slack notification:", e);
  }
}
