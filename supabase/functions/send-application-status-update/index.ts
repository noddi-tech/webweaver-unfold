import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const statusConfig: Record<string, { emoji: string; title: string; message: string }> = {
  under_review: {
    emoji: "👀",
    title: "Your application is being reviewed",
    message: "Great news! Our team is now reviewing your application. We'll be in touch soon with next steps.",
  },
  interview_scheduled: {
    emoji: "🗓️",
    title: "Interview Invitation",
    message: "We'd love to learn more about you! We're scheduling an interview for this position. Our team will reach out with available times.",
  },
  interview_completed: {
    emoji: "✅",
    title: "Interview Completed",
    message: "Thank you for taking the time to interview with us. We're reviewing all candidates and will be in touch soon with our decision.",
  },
  offer_extended: {
    emoji: "🎉",
    title: "Offer Extended!",
    message: "Congratulations! We're excited to extend an offer for this position. Our team will be in touch with the details.",
  },
  hired: {
    emoji: "🚀",
    title: "Welcome to the Team!",
    message: "We're thrilled to have you join Navio! You'll receive onboarding information shortly.",
  },
  rejected: {
    emoji: "📋",
    title: "Application Update",
    message: "Thank you for your interest in this position. After careful consideration, we've decided to move forward with other candidates. We encourage you to apply for future openings.",
  },
  withdrawn: {
    emoji: "↩️",
    title: "Application Withdrawn",
    message: "Your application has been withdrawn as requested. Thank you for your interest in Navio, and we hope to hear from you in the future.",
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

    const config = statusConfig[newStatus];
    if (!config) {
      console.log(`No email template for status: ${newStatus}`);
      return new Response(
        JSON.stringify({ success: true, message: "No template for this status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://navio.no";
    const isPositiveOutcome = ["interview_scheduled", "offer_extended", "hired"].includes(newStatus);
    const isRejection = newStatus === "rejected";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${isRejection ? '#64748b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${config.emoji} ${config.title}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${applicantName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      ${config.message}
    </p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
      <p style="margin: 0; color: #475569;">
        <strong>Position:</strong> ${jobTitle}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      ${isRejection ? `
        <a href="${siteUrl}/en/careers" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Open Positions →
        </a>
      ` : `
        <a href="${siteUrl}/en/my-applications" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Application Status →
        </a>
      `}
    </div>
    
    <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
      Best regards,<br>
      <strong>The Navio Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Navio. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Navio Careers <careers@navio.no>",
        to: [applicantEmail],
        subject: `Application Update - ${jobTitle}`,
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
