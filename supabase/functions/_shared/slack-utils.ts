import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SlackSetting {
  webhook_url: string | null;
  enabled: boolean;
  notification_types: string[];
}

/**
 * Get Slack webhook URL for a specific category and notification type
 * Falls back to SLACK_WEBHOOK_URL environment variable if not configured
 */
export async function getSlackWebhookUrl(
  category: "sales" | "careers" | "general",
  notificationType: string
): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Supabase credentials not available, using fallback");
    return Deno.env.get("SLACK_WEBHOOK_URL") || null;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase
      .from("slack_settings")
      .select("webhook_url, enabled, notification_types")
      .eq("category", category)
      .single();

    if (error) {
      console.log("Error fetching slack settings:", error.message);
      return Deno.env.get("SLACK_WEBHOOK_URL") || null;
    }

    const setting = data as SlackSetting;

    // Check if notifications are enabled
    if (!setting.enabled) {
      console.log(`Slack notifications disabled for category: ${category}`);
      return null;
    }

    // Check if this notification type is enabled
    if (!setting.notification_types?.includes(notificationType)) {
      console.log(`Notification type ${notificationType} not enabled for ${category}`);
      return null;
    }

    // Return configured webhook URL or fallback
    return setting.webhook_url || Deno.env.get("SLACK_WEBHOOK_URL") || null;
  } catch (err) {
    console.error("Error in getSlackWebhookUrl:", err);
    return Deno.env.get("SLACK_WEBHOOK_URL") || null;
  }
}

/**
 * Send a message to Slack
 */
export async function sendSlackMessage(
  webhookUrl: string,
  message: {
    text: string;
    blocks?: unknown[];
    attachments?: unknown[];
  }
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Slack API error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Slack message:", error);
    return false;
  }
}
