import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Check if navio.no domain is verified in Resend, fallback to test domain
const getFromAddress = async (apiKey: string): Promise<string> => {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const domains = await res.json();
    
    const navioVerified = domains.data?.some(
      (d: { name: string; status: string }) => d.name === "navio.no" && d.status === "verified"
    );
    
    if (navioVerified) {
      return "Navio Careers <careers@navio.no>";
    }
  } catch (e) {
    console.log("Domain check failed, using fallback:", e);
  }
  
  return "Navio <onboarding@resend.dev>";
};

const replaceVariables = (text: string, vars: Record<string, string>): string => {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || ""),
    text
  );
};

// Generate ICS calendar file content
const generateICS = (
  title: string,
  description: string,
  startTime: Date,
  durationMinutes: number,
  location: string,
  meetingUrl?: string
): string => {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  
  const uid = `${Date.now()}-interview@navio.no`;
  const locationStr = meetingUrl || location;
  const descWithUrl = meetingUrl ? `${description}\n\nJoin: ${meetingUrl}` : description;
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Navio//Interview Scheduler//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${title}
DESCRIPTION:${descWithUrl.replace(/\n/g, "\\n")}
LOCATION:${locationStr}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
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

    const { 
      applicationId, 
      applicantName, 
      applicantEmail, 
      jobTitle,
      interviewType,
      interviewDate,
      interviewTime,
      interviewDuration,
      interviewLocation,
      meetingUrl,
      notes
    } = await req.json();

    if (!applicationId || !applicantEmail || !interviewDate || !interviewTime) {
      throw new Error("Missing required fields");
    }

    // Fetch email template from database
    const { data: template } = await supabaseClient
      .from("email_templates")
      .select("*")
      .eq("template_key", "interview_invitation")
      .eq("is_active", true)
      .single();

    const siteUrl = "https://navio.no";
    const currentYear = new Date().getFullYear().toString();
    
    const variables: Record<string, string> = {
      applicant_name: applicantName || "Applicant",
      job_title: jobTitle || "Position",
      site_url: siteUrl,
      current_year: currentYear,
      interview_type: interviewType || "Interview",
      interview_date: interviewDate,
      interview_time: interviewTime,
      interview_duration: interviewDuration?.toString() || "60",
      interview_location: interviewLocation || "TBD",
      meeting_url: meetingUrl || "",
      interview_notes: notes || "",
    };

    // Use template or defaults
    const subject = replaceVariables(
      template?.subject || "Interview Scheduled: {{job_title}} at Navio",
      variables
    );
    const heading = replaceVariables(
      template?.heading || "You're Invited to Interview! 🎉",
      variables
    );
    
    // Build body with meeting link conditionally
    let bodyHtml = template?.body_html || `
<p>Hi {{applicant_name}},</p>
<p>We're excited to invite you to an interview for the <strong>{{job_title}}</strong> position at Navio!</p>
<p><strong>Interview Details:</strong></p>
<ul>
<li><strong>Date & Time:</strong> {{interview_date}} at {{interview_time}}</li>
<li><strong>Duration:</strong> {{interview_duration}} minutes</li>
<li><strong>Type:</strong> {{interview_type}}</li>
<li><strong>Location:</strong> {{interview_location}}</li>
</ul>
${meetingUrl ? `<p><strong>Meeting Link:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ""}
${notes ? `<p>${notes}</p>` : ""}
<p>Please confirm your attendance. If you need to reschedule, please reply to this email.</p>
<p>We look forward to speaking with you!</p>
<p>Best regards,<br>The Navio Team</p>`;

    bodyHtml = replaceVariables(bodyHtml, variables);
    
    const buttonText = "View My Applications";
    const buttonUrl = `${siteUrl}/en/my-applications`;
    const emoji = template?.emoji || "📅";
    const headerBgStart = template?.header_bg_start || "#8b5cf6";
    const headerBgEnd = template?.header_bg_end || "#6d28d9";

    // Build email HTML
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
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${headerBgStart}, ${headerBgEnd}); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
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

    // Generate ICS file for calendar attachment
    const scheduledDateTime = new Date(`${interviewDate} ${interviewTime}`);
    const icsContent = generateICS(
      `Interview: ${jobTitle} at Navio`,
      `Interview for ${jobTitle} position.\n\nType: ${interviewType}${notes ? `\n\nNotes: ${notes}` : ""}`,
      scheduledDateTime,
      interviewDuration || 60,
      interviewLocation || "TBD",
      meetingUrl
    );

    const fromAddress = await getFromAddress(RESEND_API_KEY);

    // Convert ICS to base64
    const icsBase64 = btoa(icsContent);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [applicantEmail],
        subject,
        html: emailHtml,
        attachments: [
          {
            filename: "interview.ics",
            content: icsBase64,
          },
        ],
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Interview invitation sent:", result.id);

    // Log activity
    await supabaseClient.from("application_activity_log").insert({
      application_id: applicationId,
      action: "email_sent",
      new_value: `Interview invitation: ${interviewType} on ${interviewDate}`,
    });

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-interview-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
