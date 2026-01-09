import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationConfirmationRequest {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  applicationId: string;
  templateOverride?: {
    subject?: string;
    heading?: string;
    body_html?: string;
    button_text?: string;
    button_url?: string;
    emoji?: string;
    header_bg_start?: string;
    header_bg_end?: string;
  };
}

interface EmailTemplate {
  subject: string;
  heading: string;
  body_html: string;
  button_text: string | null;
  button_url: string | null;
  emoji: string;
  header_bg_start: string;
  header_bg_end: string;
}

// Check if navio.no is verified, fallback to resend test domain
async function getFromAddress(apiKey: string): Promise<string> {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    
    if (res.ok) {
      const domains = await res.json();
      const navioVerified = domains.data?.some(
        (d: { name: string; status: string }) => 
          d.name === "navio.no" && d.status === "verified"
      );
      
      if (navioVerified) {
        console.log("Using verified navio.no domain");
        return "Navio Careers <careers@navio.no>";
      }
    }
  } catch (e) {
    console.log("Domain check failed:", e);
  }
  
  console.log("Using Resend test domain as fallback");
  return "Navio Careers <onboarding@resend.dev>";
}

function replaceVariables(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => 
      result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value),
    text
  );
}

function buildEmailHtml(template: EmailTemplate, vars: Record<string, string>): string {
  const subject = replaceVariables(template.subject, vars);
  const heading = replaceVariables(template.heading, vars);
  const body = replaceVariables(template.body_html, vars);
  const buttonText = template.button_text ? replaceVariables(template.button_text, vars) : null;
  const buttonUrl = template.button_url ? replaceVariables(template.button_url, vars) : null;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${template.header_bg_start} 0%, ${template.header_bg_end} 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${heading}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    ${body}
    
    ${buttonText && buttonUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${template.header_bg_start} 0%, ${template.header_bg_end} 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${buttonText}
      </a>
    </div>
    ` : ""}
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>© ${vars.current_year} Navio. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { applicantName, applicantEmail, jobTitle, applicationId, templateOverride }: ApplicationConfirmationRequest = await req.json();

    const siteUrl = Deno.env.get("SITE_URL") || "https://navio.no";
    
    // Template variables
    const vars: Record<string, string> = {
      applicant_name: applicantName,
      job_title: jobTitle,
      site_url: siteUrl,
      current_year: new Date().getFullYear().toString(),
    };

    // Get template from database or use override
    let template: EmailTemplate;
    
    if (templateOverride) {
      // For test emails from CMS
      template = {
        subject: templateOverride.subject || "Application Received - {{job_title}} at Navio",
        heading: templateOverride.heading || "🎉 Application Received!",
        body_html: templateOverride.body_html || "<p>Thank you for applying!</p>",
        button_text: templateOverride.button_text || null,
        button_url: templateOverride.button_url || null,
        emoji: templateOverride.emoji || "🎉",
        header_bg_start: templateOverride.header_bg_start || "#667eea",
        header_bg_end: templateOverride.header_bg_end || "#764ba2",
      };
    } else {
      // Fetch from database
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: dbTemplate, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", "application_confirmation")
        .eq("is_active", true)
        .single();
      
      if (templateError || !dbTemplate) {
        console.log("Template not found, using defaults");
        template = {
          subject: "Application Received - {{job_title}} at Navio",
          heading: "🎉 Application Received!",
          body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>Thank you for applying to <strong>{{job_title}}</strong> at Navio. We've received your application and our team will review it shortly.</p>`,
          button_text: "View My Applications →",
          button_url: "{{site_url}}/en/my-applications",
          emoji: "🎉",
          header_bg_start: "#667eea",
          header_bg_end: "#764ba2",
        };
      } else {
        template = dbTemplate;
      }
    }

    const emailHtml = buildEmailHtml(template, vars);
    const subject = replaceVariables(template.subject, vars);
    const fromAddress = await getFromAddress(RESEND_API_KEY);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [applicantEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
