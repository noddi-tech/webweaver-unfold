import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Check domain verification - prioritize naviosolutions.com
const getFromAddress = async (apiKey: string): Promise<string> => {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const domains = await res.json();
    
    // Check naviosolutions.com first
    const navioSolutionsVerified = domains.data?.some(
      (d: { name: string; status: string }) => 
        d.name === "naviosolutions.com" && d.status === "verified"
    );
    if (navioSolutionsVerified) {
      console.log("Using verified naviosolutions.com domain");
      return "Navio Careers <careers@naviosolutions.com>";
    }
    
    // Fallback to navio.no
    const navioVerified = domains.data?.some(
      (d: { name: string; status: string }) => d.name === "navio.no" && d.status === "verified"
    );
    if (navioVerified) {
      console.log("Using verified navio.no domain");
      return "Navio Careers <careers@navio.no>";
    }
  } catch (e) {
    console.log("Domain check failed, using fallback:", e);
  }
  
  console.log("Using Resend test domain as fallback");
  return "Navio Careers <onboarding@resend.dev>";
};

const replaceVariables = (text: string, vars: Record<string, string>): string => {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || ""),
    text
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { applicationId, applicantName, applicantEmail, jobTitle, messageBody } = await req.json();

    if (!applicationId || !applicantEmail || !messageBody) {
      throw new Error("Missing required fields: applicationId, applicantEmail, messageBody");
    }

    // Fetch email template from database
    const { data: template } = await supabaseClient
      .from("email_templates")
      .select("*")
      .eq("template_key", "admin_reply")
      .eq("is_active", true)
      .single();

    const siteUrl = "https://naviosolutions.com";
    const currentYear = new Date().getFullYear().toString();
    
    const variables: Record<string, string> = {
      applicant_name: applicantName || "Applicant",
      job_title: jobTitle || "Position",
      site_url: siteUrl,
      current_year: currentYear,
      message_body: messageBody,
    };

    const subject = replaceVariables(
      template?.subject || "Re: Your Application for {{job_title}} at Navio",
      variables
    );
    const heading = replaceVariables(
      template?.heading || "Message from Navio",
      variables
    );
    const bodyHtml = replaceVariables(
      template?.body_html || `<p>Hi {{applicant_name}},</p><p>{{message_body}}</p>`,
      variables
    );
    const buttonText = template?.button_text ? replaceVariables(template.button_text, variables) : "View My Applications";
    const buttonUrl = template?.button_url ? replaceVariables(template.button_url, variables) : `${siteUrl}/en/my-applications`;
    const emoji = template?.emoji || "💬";
    const headerBgStart = template?.header_bg_start || "#3b82f6";
    const headerBgEnd = template?.header_bg_end || "#1d4ed8";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, ${headerBgStart}, ${headerBgEnd}); padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${emoji}</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${heading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${bodyHtml}
              </div>
              ${buttonText && buttonUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${headerBgStart}, ${headerBgEnd}); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © ${currentYear} Navio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const fromAddress = await getFromAddress(RESEND_API_KEY);

    // Generate reply-to address for candidate replies
    const replyToAddress = `application+${applicationId}@replies.naviosolutions.com`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        reply_to: replyToAddress,
        to: [applicantEmail],
        subject,
        html: emailHtml,
        headers: {
          "X-Application-ID": applicationId,
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result.id);

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-candidate-message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
