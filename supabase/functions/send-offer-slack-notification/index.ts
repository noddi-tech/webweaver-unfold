import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfferNotification {
  event_type: "sent" | "viewed" | "accepted" | "question";
  company_name: string;
  contact_name: string;
  contact_email: string;
  tier?: string;
  monthly_cost?: number;
  question_text?: string;
  offer_url?: string;
}

async function getSlackWebhookUrl(category: string, notificationType?: string): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("slack_settings")
      .select("webhook_url, enabled, notification_types")
      .eq("category", category)
      .single();

    if (error || !data) {
      console.log(`No Slack settings found for category: ${category}, falling back to env var`);
      return Deno.env.get("SLACK_WEBHOOK_URL") || null;
    }

    if (!data.enabled) {
      console.log(`Slack notifications disabled for category: ${category}`);
      return null;
    }

    if (notificationType && data.notification_types) {
      const types = data.notification_types as string[];
      if (!types.includes(notificationType)) {
        console.log(`Notification type ${notificationType} not enabled for category: ${category}`);
        return null;
      }
    }

    return data.webhook_url || Deno.env.get("SLACK_WEBHOOK_URL") || null;
  } catch (err) {
    console.error("Error fetching Slack settings:", err);
    return Deno.env.get("SLACK_WEBHOOK_URL") || null;
  }
}

async function sendSlackMessage(webhookUrl: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Slack API error:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send Slack message:", err);
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: OfferNotification = await req.json();
    const notificationType = `offer_${notification.event_type}`;
    
    const slackWebhookUrl = await getSlackWebhookUrl("sales", notificationType);
    if (!slackWebhookUrl) {
      console.log(`Slack not configured or notification type ${notificationType} disabled`);
      return new Response(JSON.stringify({ skipped: true, reason: "Slack not configured or disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Sending offer Slack notification:", notification.event_type);

    let emoji: string;
    let message: string;
    let color: string;

    switch (notification.event_type) {
      case "sent":
        emoji = "📧";
        message = `Pricing offer sent to *${notification.company_name}*`;
        color = "#2196F3";
        break;
      case "viewed":
        emoji = "👀";
        message = `*${notification.company_name}* viewed their pricing offer`;
        color = "#FF9800";
        break;
      case "accepted":
        emoji = "🎉";
        message = `*${notification.company_name}* accepted the pricing offer!`;
        color = "#4CAF50";
        break;
      case "question":
        emoji = "❓";
        message = `*${notification.company_name}* has a question about their offer`;
        color = "#9C27B0";
        break;
      default:
        emoji = "📋";
        message = `Offer update for *${notification.company_name}*`;
        color = "#607D8B";
    }

    const blocks: unknown[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} ${message}`,
        },
      },
    ];

    const contextElements: unknown[] = [
      {
        type: "mrkdwn",
        text: `👤 ${notification.contact_name} (${notification.contact_email})`,
      },
    ];

    if (notification.tier && notification.monthly_cost) {
      contextElements.push({
        type: "mrkdwn",
        text: `💰 ${notification.tier} plan - ${notification.monthly_cost.toLocaleString("nb-NO")} NOK/month`,
      });
    }

    blocks.push({
      type: "context",
      elements: contextElements,
    });

    if (notification.question_text) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `> ${notification.question_text}`,
        },
      });
    }

    if (notification.offer_url) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Offer",
            },
            url: notification.offer_url,
          },
        ],
      });
    }

    const success = await sendSlackMessage(slackWebhookUrl, {
      text: `${emoji} ${message}`,
      attachments: [
        {
          color,
          blocks,
        },
      ],
    });

    if (!success) {
      throw new Error("Failed to send Slack message");
    }

    console.log("Slack notification sent successfully");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending Slack notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
