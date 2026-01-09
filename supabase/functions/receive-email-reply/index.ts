import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

// Parse application ID from email address
// Format: application+{applicationId}@replies.navio.no
const parseApplicationIdFromAddress = (toAddresses: string[]): string | null => {
  for (const addr of toAddresses) {
    const match = addr.match(/application\+([a-f0-9-]+)@/i);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Strip HTML and extract plain text
const stripHtml = (html: string): string => {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Remove email signature and quoted text
const cleanEmailBody = (text: string): string => {
  // Common signature indicators
  const signaturePatterns = [
    /^--\s*$/m,
    /^Sent from my/im,
    /^On .+ wrote:$/m,
    /^From:/m,
    /^>+/m,
  ];

  let cleanedText = text;
  
  // Find the earliest signature/quote indicator
  let cutoffIndex = text.length;
  for (const pattern of signaturePatterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined && match.index < cutoffIndex) {
      cutoffIndex = match.index;
    }
  }

  cleanedText = text.substring(0, cutoffIndex).trim();
  
  return cleanedText;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the webhook payload from Resend
    const payload = await req.json();
    
    console.log("Received email webhook:", JSON.stringify(payload, null, 2));

    // Resend inbound email webhook format
    if (payload.type !== "email.received") {
      return new Response(JSON.stringify({ message: "Ignored event type" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailData = payload.data;
    
    // Extract application ID from To address
    const toAddresses = emailData.to || [];
    const applicationId = parseApplicationIdFromAddress(toAddresses);
    
    if (!applicationId) {
      console.log("Could not parse application ID from addresses:", toAddresses);
      return new Response(JSON.stringify({ error: "Invalid reply address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the application exists
    const { data: application, error: appError } = await supabaseClient
      .from("job_applications")
      .select("id, applicant_name, applicant_email")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      console.error("Application not found:", applicationId);
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract email content
    const fromEmail = emailData.from?.email || emailData.from;
    const fromName = emailData.from?.name || fromEmail?.split("@")[0] || "Candidate";
    const subject = emailData.subject || "Re: Application";
    
    // Get body - prefer text, fallback to stripped HTML
    let body = emailData.text || "";
    if (!body && emailData.html) {
      body = stripHtml(emailData.html);
    }
    
    // Clean the body to remove quotes and signatures
    body = cleanEmailBody(body);

    if (!body) {
      console.log("Empty email body received");
      return new Response(JSON.stringify({ error: "Empty message body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save the message to application_messages
    const { data: message, error: msgError } = await supabaseClient
      .from("application_messages")
      .insert({
        application_id: applicationId,
        sender_type: "candidate",
        sender_name: fromName,
        sender_email: fromEmail,
        subject,
        body,
        is_read: false,
      })
      .select()
      .single();

    if (msgError) {
      console.error("Failed to save message:", msgError);
      throw msgError;
    }

    console.log("Message saved:", message.id);

    // Log activity
    await supabaseClient.from("application_activity_log").insert({
      application_id: applicationId,
      action: "message_received",
      new_value: `Reply from candidate: ${subject}`,
    });

    // Send Slack notification if configured
    const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
    if (SLACK_WEBHOOK_URL) {
      try {
        await fetch(SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `📬 New reply from candidate`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*New Reply from ${fromName}*\n${body.substring(0, 200)}${body.length > 200 ? "..." : ""}`,
                },
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `Application: ${application.applicant_name} | <https://navio.no/cms?section=inbox|View in Inbox>`,
                  },
                ],
              },
            ],
          }),
        });
      } catch (slackError) {
        console.error("Slack notification failed:", slackError);
      }
    }

    return new Response(JSON.stringify({ success: true, messageId: message.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in receive-email-reply:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
