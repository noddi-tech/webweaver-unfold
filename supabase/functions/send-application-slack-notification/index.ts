import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSlackWebhookUrl, sendSlackMessage } from "../_shared/slack-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationNotification {
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  jobTitle: string;
  jobId: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  applicationId: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const slackWebhookUrl = await getSlackWebhookUrl("careers", "application_received");
    if (!slackWebhookUrl) {
      console.log("Slack not configured or application_received notification disabled");
      return new Response(JSON.stringify({ skipped: true, reason: "Slack not configured or disabled" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const {
      applicantName,
      applicantEmail,
      applicantPhone,
      jobTitle,
      linkedinUrl,
      portfolioUrl,
    }: ApplicationNotification = await req.json();

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build fields array dynamically
    const fields = [
      { type: "mrkdwn", text: `*Position:*\n${jobTitle}` },
      { type: "mrkdwn", text: `*Candidate:*\n${applicantName}` },
      { type: "mrkdwn", text: `*Email:*\n${applicantEmail}` },
    ];

    if (applicantPhone) {
      fields.push({ type: "mrkdwn", text: `*Phone:*\n${applicantPhone}` });
    }

    // Build context elements for links
    const contextElements = [];
    if (linkedinUrl) {
      contextElements.push({
        type: "mrkdwn",
        text: `<${linkedinUrl}|LinkedIn Profile>`,
      });
    }
    if (portfolioUrl) {
      contextElements.push({
        type: "mrkdwn",
        text: `<${portfolioUrl}|Portfolio>`,
      });
    }

    const blocks: unknown[] = [
      {
        type: "header",
        text: { type: "plain_text", text: "📋 New Job Application", emoji: true },
      },
      {
        type: "section",
        fields: fields,
      },
    ];

    // Add links context if any
    if (contextElements.length > 0) {
      blocks.push({
        type: "context",
        elements: contextElements,
      });
    }

    // Add timestamp and action button
    blocks.push(
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Applied: ${formattedDate}` },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Review Application →", emoji: true },
            url: "https://navio.no/en/admin?section=applications",
            style: "primary",
          },
        ],
      }
    );

    const success = await sendSlackMessage(slackWebhookUrl, { blocks });

    if (!success) {
      throw new Error("Failed to send Slack notification");
    }

    console.log("Slack notification sent successfully for:", applicantName);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending Slack notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
