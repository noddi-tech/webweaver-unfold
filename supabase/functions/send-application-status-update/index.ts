import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  newStatus: string;
  applicationId: string;
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

// Map application status to template key
const STATUS_TO_TEMPLATE: Record<string, string> = {
  under_review: "status_under_review",
  interview_scheduled: "status_interview_scheduled",
  interview_completed: "status_interview_completed",
  offer_extended: "status_offer_extended",
  hired: "status_hired",
  rejected: "status_rejected",
  withdrawn: "status_withdrawn",
};

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

// Default templates for each status (fallback if DB template not found)
const DEFAULT_TEMPLATES: Record<string, EmailTemplate> = {
  status_under_review: {
    subject: "Application Update - {{job_title}} at Navio",
    heading: "👀 Your Application is Under Review",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>Your application for <strong>{{job_title}}</strong> is now being reviewed by our hiring team.</p>`,
    button_text: "Check Application Status →",
    button_url: "{{site_url}}/en/my-applications",
    emoji: "👀",
    header_bg_start: "#3b82f6",
    header_bg_end: "#1d4ed8",
  },
  status_interview_scheduled: {
    subject: "Interview Invitation - {{job_title}} at Navio",
    heading: "📅 Interview Scheduled!",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>Congratulations! You've been selected for an interview for the <strong>{{job_title}}</strong> position.</p>`,
    button_text: "View Application Details →",
    button_url: "{{site_url}}/en/my-applications",
    emoji: "📅",
    header_bg_start: "#10b981",
    header_bg_end: "#059669",
  },
  status_interview_completed: {
    subject: "Thank You for Interviewing - {{job_title}} at Navio",
    heading: "✅ Interview Completed",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>Thank you for interviewing with us for the <strong>{{job_title}}</strong> position.</p>`,
    button_text: "View Application Status →",
    button_url: "{{site_url}}/en/my-applications",
    emoji: "✅",
    header_bg_start: "#8b5cf6",
    header_bg_end: "#7c3aed",
  },
  status_offer_extended: {
    subject: "Congratulations! Job Offer - {{job_title}} at Navio",
    heading: "🎊 Congratulations!",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>We're thrilled to extend you an offer for the <strong>{{job_title}}</strong> position!</p>`,
    button_text: "View Offer Details →",
    button_url: "{{site_url}}/en/my-applications",
    emoji: "🎊",
    header_bg_start: "#f59e0b",
    header_bg_end: "#d97706",
  },
  status_hired: {
    subject: "Welcome to Navio! - {{job_title}}",
    heading: "🚀 Welcome to the Team!",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>We're delighted to officially welcome you to Navio as our new <strong>{{job_title}}</strong>!</p>`,
    button_text: "Get Started →",
    button_url: "{{site_url}}/en/my-applications",
    emoji: "🚀",
    header_bg_start: "#22c55e",
    header_bg_end: "#16a34a",
  },
  status_rejected: {
    subject: "Application Update - {{job_title}} at Navio",
    heading: "Thank You for Your Interest",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>Thank you for your interest in the <strong>{{job_title}}</strong> position at Navio.</p><p>After careful consideration, we've decided to move forward with other candidates.</p>`,
    button_text: "View Other Opportunities →",
    button_url: "{{site_url}}/en/careers",
    emoji: "💼",
    header_bg_start: "#6b7280",
    header_bg_end: "#4b5563",
  },
  status_withdrawn: {
    subject: "Application Withdrawn - {{job_title}} at Navio",
    heading: "Application Withdrawn",
    body_html: `<p>Hi <strong>{{applicant_name}}</strong>,</p><p>Your application for <strong>{{job_title}}</strong> has been withdrawn as requested.</p>`,
    button_text: "View Open Positions →",
    button_url: "{{site_url}}/en/careers",
    emoji: "👋",
    header_bg_start: "#6b7280",
    header_bg_end: "#4b5563",
  },
};

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

    const { applicantName, applicantEmail, jobTitle, newStatus, applicationId }: StatusUpdateRequest = await req.json();

    const siteUrl = Deno.env.get("SITE_URL") || "https://navio.no";
    
    // Template variables
    const vars: Record<string, string> = {
      applicant_name: applicantName,
      job_title: jobTitle,
      site_url: siteUrl,
      current_year: new Date().getFullYear().toString(),
      status: newStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    };

    // Get template key for this status
    const templateKey = STATUS_TO_TEMPLATE[newStatus];
    if (!templateKey) {
      console.log(`No template for status: ${newStatus}, skipping email`);
      return new Response(
        JSON.stringify({ success: true, message: `No email template for status: ${newStatus}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch template from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: dbTemplate, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", templateKey)
      .eq("is_active", true)
      .single();
    
    let template: EmailTemplate;
    if (templateError || !dbTemplate) {
      console.log(`Template ${templateKey} not found, using default`);
      template = DEFAULT_TEMPLATES[templateKey] || DEFAULT_TEMPLATES.status_under_review;
    } else {
      template = dbTemplate;
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
    console.log("Status update email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending status update email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
